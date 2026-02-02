import {z} from 'zod';


const chatbotValidationSchema=z.object({
    body: z.object({
        text: z.string({required_error:"text is required"})
    })
});


const chatbotValidation={
    chatbotValidationSchema
};

export default chatbotValidation;