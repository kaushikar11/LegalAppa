import React, { useState, useEffect } from 'react';
import { gemini } from '../firebase/gemini';

const Generate = () => {
    const [responseText, setResponseText] = useState('');
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(gemini);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    useEffect(() => {
        async function run() {
            const prompt = "Come up with a affadavit template for advocates from madras high court madurai";
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                console.log(text);
                setResponseText(text);
            } catch (error) {
                console.error("Error generating content:", error);
                setResponseText("An error occurred while generating the story.");
            }
        }

        run();
    }, []);

    return (
        <div>
            <h1>Response</h1>
            <p>{responseText}</p>
        </div>
    );
};

export default Generate;