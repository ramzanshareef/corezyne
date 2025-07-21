"use server";

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const jwt = require('jsonwebtoken');

export const register = async (data: any, db: mongoose.Connection, session: mongoose.ClientSession) => {
    if (!data?.email || !data?.password) throw new Error("Missing email or password");
    const isValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(data.password);
    if (!isValid) {
        throw new Error("Password not strong enough");
    }
    const users = db.collection("users");
    const userAlreadyExists = await users.findOne({ email: data.email }, { session });
    if (userAlreadyExists) {
        throw new Error("User already exists");
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await users.insertOne({ ...data, password: hashed }, { session });
    const token = jwt.sign(
        {
            email: data.email,
            _id: user.insertedId,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" });
    return { token };
}

export const login = async (data: any, db: mongoose.Connection, session: mongoose.ClientSession) => {
    if (!data?.email || !data?.password) {
        throw new Error("Missing email or password");
    }
    const users = db.collection("users");
    const user = await users.findOne({ email: data.email }, { session });
    if (!user) throw new Error("Invalid Credentials");
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error("Invalid Credentials");
    const token = jwt.sign(
        {
            email: user.email,
            _id: user._id
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );
    return { token };
}