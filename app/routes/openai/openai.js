const dotenv = require('dotenv').config({ path: __dirname + '/key.env' });
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateQuestion = async (category, answers) => {

  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: `Suggest a trivia question in category "${category}" and provide ${answers} possible answers. Use the following format for response {"question": ..., "ans 1": ..., etc, "correct:"...}`}],
    "temperature": 1,
    "max_tokens": 200

  });

  console.log(result.choices[0]);

  return result.choices[0].message.content;
}

const generateHint = async (question) => {
  
  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
    { role: "system", content: "Provide a short hint to the question." },
    {role: "user", content: `${question}`}],
    "temperature": 1,
    "max_tokens": 150

  });

  console.log(result.choices[0]);

  return result.choices[0].message.content;
}

function parseData(data) {
  const parsedData = JSON.parse(data);
  const result = {};

  result.question = parsedData.question;
  result.answer = parsedData.correct;

  result.options = Object.keys(parsedData)
      .filter(key => key !== 'question' && key != 'correct')
      .map(key => parsedData[key]);

  return result;
}

function sanitizeInput(input) {

  if (typeof input !== 'string') {
    input = String(input);
  }

  return input.replace(/[^a-zA-Z0-9' ']/g, '');
}

function limitWords(input) {

  const words = input.trim().split(/\s+/);
  const result = words.slice(0, 2).join(' ');

  return result;
}

const openAiApi = (express, requireAuth) => {

  const openAiRouter = express.Router();

  openAiRouter.route('/question')
  .post(requireAuth, async function(req, res) {

    console.log(req.body);

    const question = {
      category : limitWords(sanitizeInput(req.body.category)),
      answers : limitWords(sanitizeInput(req.body.answers))
    };
  
    try {
      const data = await generateQuestion(question.category, question.answers);
      const result = parseData(data);
  
      res.json({ status: 'OK', result: result });
  
    } catch (e){
    
        res.json({ status: 'NOT OK' });
    }

  });

  openAiRouter.route('/hint')
  .post(requireAuth, async function(req, res) {

    console.log(req.body);

    const question = req.body.question;
  
    try {
      const data = {hint: await generateHint(question)};

      res.json({ status: 'OK', result: data });
  
    } catch (e){
    
        res.json({ status: 'NOT OK' });
    }

  });

  return openAiRouter;

}

exports.openAiApi = openAiApi;