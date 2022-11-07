const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const { generateToken } = require("../helpers/token");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Post = require("../models/posts");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../helpers/mailer");
const mongoose = require("mongoose");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({
        message: "The email address already exists",
      });
    }

    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: "first name must between 3 and 30 characters",
      });
    }

    if (!validateLength(last_name, 3, 30)) {
      return res.status(400).json({
        message: "last name must between 3 and 30 characters",
      });
    }

    if (!validateLength(password, 6, 15)) {
      return res.status(400).json({
        message: "password must be 6 characters",
      });
    }

    const cryptedPassword = await bcrypt.hash(password, 12);

    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);

    const user = await new User({
      first_name,
      last_name,
      email,
      password: cryptedPassword,
      username: newUsername,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const uri = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, uri);
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      friends: user.friends,
      isBlocked: user.isBlocked,
      requests: user.requests,
      message: "Register Success ! please activate your email to start",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.activateAccount = async (req, res) => {
  try {
    const validUser = req.user.id;
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const check = await User.findById(user.id);

    if (validUser !== user.id) {
      return res.status(400).json({
        message: "You don't have the authorization to complete the process",
      });
    }

    if (check.verified == true) {
      return res
        .status(400)
        .json({ message: "This Email is already activated" });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res
        .status(200)
        .json({ message: "Account has been activated succesfully." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "There is no account associated with the email id" });

    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({ message: "Invalid Credentials enterred" });
    }
    if (user.isBlocked) {
      return res
        .status(400)
        .json({ message: "The is user is blocked by the admin" });
    }
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      friends: user.friends,
      isBlocked: user.isBlocked,
      stories: user.stories,
      requests: user.requests,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.sendVerification = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (user.verified === true) {
      return res
        .status(400)
        .json({ message: "This account is already activated" });
    }
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const uri = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, uri);
    return res
      .status(200)
      .json({ message: "Email verification link has been sent." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findById(req.user.id);
    const profile = await User.findOne({ username }).select("-password");

    const friendship = {
      friends: false,
      requestSent: false,
      requestRecieved: false,
    };
    if (!profile) {
      return res.json({ ok: false });
    }
    if (
      user.friends.includes(profile._id) &&
      profile.friends.includes(user._id)
    ) {
      friendship.friends = true;
    }
    if (user.requests.includes(profile._id)) {
      friendship.requestRecieved = true;
    }
    if (profile.requests.includes(user._id)) {
      friendship.requestSent = true;
    }
    const posts = await Post.find({ user: profile._id })
      .populate("user")
      .populate(
        "comments.commentBy",
        "first_name last_name picture username commentAt"
      )
      .sort({ ceatedAt: -1 });
    await profile.populate("friends", "first_name last_name username picture");
    res.json({ ...profile.toObject(), posts, friendship });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.updateProfilePicture = async (req, res) => {
  try {
    const { url } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      picture: url,
    });
    res.json(url);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.updateCoverPicture = async (req, res) => {
  try {
    const { url } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      cover: url,
    });
    res.json(url);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add Friend
exports.addFriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const reciever = await User.findById(req.params.id);
      if (
        !reciever.requests.includes(sender._id) &&
        !reciever.friends.includes(sender._id)
      ) {
        await reciever.updateOne({
          $push: { requests: sender._id },
        });
        res.json({ message: "Friend requests has been sent" });
      } else {
        return res.status(400).json({ message: "The request is already sent" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't send friend requests yourself" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.cancelRequests = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const reciever = await User.findById(req.params.id);
      if (
        reciever.requests.includes(sender._id) &&
        !reciever.friends.includes(sender._id)
      ) {
        await reciever.updateOne({
          $pull: { requests: sender._id },
        });
        res.json({ message: "You succesfully cancelled the requests" });
      } else {
        return res.status(400).json({ message: "Already cancelled" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't cancel friend requests yourself" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.acceptRequset = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const reciever = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (reciever.requests.includes(sender._id)) {
        await reciever.updateOne({
          $push: {
            friends: sender._id,
          },
        });
        await sender.updateOne({
          $push: { friends: reciever._id },
        });
        await reciever.updateOne({
          $pull: {
            requests: sender._id,
          },
        });
        res.json({ message: "friend request accepted" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't accept request yourself" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.unFriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const reciever = await User.findById(req.params.id);
      if (
        reciever.friends.includes(sender._id) &&
        sender.friends.includes(reciever._id)
      ) {
        await reciever.updateOne({
          $pull: {
            friends: sender._id,
          },
        });
        await sender.updateOne({
          $pull: {
            friends: reciever._id,
          },
        });
        res.json({ message: "Unfriend request accepted" });
      } else {
        return res.status(400).json({ message: "Already not friends" });
      }
    } else {
      return res.status(400).json({ message: "You can't unfriend yourself" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const reciever = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (reciever.requests.includes(sender._id)) {
        await reciever.updateOne({
          $pull: {
            requests: sender._id,
          },
        });
        await sender.updateOne({
          $pull: {
            requests: sender._id,
          },
        });
        res.json({ message: "delete request accepted" });
      } else {
        return res.status(400).json({ message: "Already deleted" });
      }
    } else {
      return res.status(400).json({ message: "You can't delete yourself" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.updateDetails = async (req, res) => {
  try {
    const { infos } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { details: infos },
      { new: true }
    );
    res.json(updated.details);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.search = async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;
    const results = await User.find({ $text: { $search: searchTerm } }).select(
      "first_name last_name username picture"
    );
    res.json(results);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.addToSearchHistory = async (req, res) => {
  try {
    const { searchUser } = req.body;
    const search = {
      user: searchUser,
      createdAt: new Date(),
    };
    const user = await User.findById(req.user.id);
    const check = user.search.find((x) => x.user.toString() === searchUser);
    if (check) {
      await User.updateOne(
        { _id: req.user.id, "search._id": check._id },
        {
          $set: { "search.$.createdAt": new Date() },
        }
      );
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          search,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getSearchHistory = async (req, res) => {
  try {
    const results = await User.findById(req.user.id)
      .select("search")
      .populate("search.user", "first_name last_name picture username");
    res.json(results.search);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "first_name last_name username gender picture"
    );
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const friends = await User.findById(req.user.id)
      .select("first_name last_name username picture friends")
      .populate("friends", "first_name last_name username picture");
    res.json(friends);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getFriendsPageInfos = async (req, res) => {
  try {
    const friend = await User.findById(req.user.id)
      .select("friends requests")
      .populate("friends", "first_name last_name username picture")
      .populate("requests", "first_name last_name username picture");
    const sentRequests = await User.find({
      requests: mongoose.Types.ObjectId(req.user.id),
    }).select("first_name last_name username picture");
    res.json({
      friends: friend.friends,
      request: friend.requests,
      sentRequests,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.friendSuggestions = async (req, res) => {
  try {
    const allUsers = await User.find().select(
      "picture username first_name last_name friends requests"
    );
    res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
