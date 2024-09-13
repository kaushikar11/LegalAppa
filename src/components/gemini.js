import React, { useState, useEffect } from 'react';
import { gemini } from '../firebase/gemini';
import { GoogleGenerativeAI } from "@google/generative-ai";

const Generate = () => {
    const [responseText, setResponseText] = useState('');
    const genAI = new GoogleGenerativeAI(gemini);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    useEffect(() => {
        async function run() {
            const initialPrompt = "Come up with an affidavit template for advocates from Madras High Court Madurai";
            try {
                // First pass
                const initialResult = await model.generateContent(initialPrompt);
                const initialResponse = await initialResult.response;
                const initialText = initialResponse.text();

                // Second pass
                const improvementPrompt = `
                    You previously generated the following content in response to the prompt "${initialPrompt}":

                    ${initialText}

                    Please reevaluate this content and improve it if necessary. Consider the following:
                    1. Is the affidavit template complete and accurate for the Madras High Court Madurai?
                    2. Does it include all necessary legal components?
                    3. Is the language clear and professional?
                    4. Are there any areas that could be expanded or clarified?

                    If improvements are needed, please provide an updated version with no extra text. If the original is satisfactory, you can return it as it was with no extra text.
                `;

                const improvedResult = await model.generateContent(improvementPrompt);
                const improvedResponse = await improvedResult.response;
                const improvedText = improvedResponse.text();

                console.log("Improved text:", improvedText);
                setResponseText(improvedText);
            } catch (error) {
                console.error("Error generating content:", error);
                setResponseText("An error occurred while generating the affidavit template.");
            }
        }
        run();
    }, []);

    return (
        <div>
            <h1>Affidavit Template</h1>
            <p>{responseText}</p>
        </div>
    );
};

export default Generate;
