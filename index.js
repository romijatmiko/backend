require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./model/User");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Berhasil terhubung ke MongoDB"))
	.catch((err) => {
		console.error("Gagal terhubung ke MongoDB:", err.message);
		process.exit(1);
	});

app.post("/users", async (req, res) => {
	try {
		const { name, email } = req.body;
		if (!name || !email) {
			return res.status(400).json({ message: "nama dan email harus diisi" });
		}
		const checkRegisterUser = await User.findOne({ email });
		if (checkRegisterUser) {
			return res.status(400).json({ message: "email sudah digunakan" });
		}
		const newUser = new User({ name, email });
		await newUser.save();
		res.status(201).json({ message: "User berhasil dibuat", user: newUser });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

app.get("/users", async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get("/users/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.put("/users/:id", async (req, res) => {
	try {
		const { name, email } = req.body;
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{ name, email },
			{ new: true, runValidators: true }
		);
		if (!updatedUser)
			return res.status(404).json({ message: "User tidak ditemukan" });
		res
			.status(200)
			.json({ message: "User berhasil diperbarui", user: updatedUser });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

app.delete("/users/:id", async (req, res) => {
	try {
		const deletedUser = await User.findByIdAndDelete(req.params.id);
		if (!deletedUser)
			return res.status(404).json({ message: "User tidak ditemukan" });
		res
			.status(200)
			.json({ message: "User berhasil dihapus", user: deletedUser });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.listen(PORT, () => {
	console.log(`Server berjalan di http://localhost:${PORT}`);
});
