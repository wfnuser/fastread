'use strict';
const AnswerModel = require('../model/answer');
const QuestionModel = require('../model/askQuestion');
const jwt =require('../middleware/jwt');

const createAnswer = async(ctx)=>{
    let token = jwt.getToken(ctx);
    let userId = token.id;
    try {
        let answer = new AnswerModel({
            "user":userId,
            "question":ctx.request.body.question,
            "answer":ctx.request.body.answer,
        });
        let answers = await answer.save();
        await QuestionModel.update({"_id":ctx.request.body.question},﻿{'$push':{"answer":answers._id}}).exec();
        let answerNum = await QuestionModel.find({"_id":ctx.request.body.question}).exec();
        answerNum=answerNum[0]['answerNum']+1;
        await QuestionModel.update({"_id":ctx.request.body.question},{"answerNum":answerNum}).exec();
        ctx.status=200;
        ctx.body={_id:answers._id}
    }catch (e) {
        ctx.status=403;
        ctx.body={err:e}
    }
};
const getAnswerByQuestionId = async(ctx)=>{
    let page = ctx.request.body.page || 1;
    let limit = Number(ctx.request.body.limit) || 10;
    let skip = (page - 1) * limit;
    let question = ctx.request.body.id;
    let answers =await AnswerModel.find({"question":question}).sort({"likeNum":-1}).skip(skip).limit(limit).exec();
    ctx.status=200;
    ctx.body=answers;
};
module.exports.securedRouters = {
    'POST /createAnswer':createAnswer
};
module.exports.routers = {
    'POST /getAnswerByQuestionId':getAnswerByQuestionId
};
