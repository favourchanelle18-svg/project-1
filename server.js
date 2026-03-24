import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());

const openai=new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.post("/ask-ai", async (req,res)=>{
  try{
    const {question, lesson}=req.body;
    const prompt=`You are a helpful K-12 tutor. Explain the following question in simple terms:\nLesson: ${lesson.title}\nQuestion: ${question}`;
    const response=await openai.chat.completions.create({
      model:"gpt-4",
      messages:[{role:"system", content:"You are a helpful K-12 tutor."},{role:"user", content: prompt}]
    });
    res.json({answer: response.choices[0].message.content});
  } catch(err){
    console.error(err);
    res.status(500).json({answer:"Sorry, something went wrong."});
  }
});

app.listen(5000, ()=>console.log("Server running on port 5000"));
