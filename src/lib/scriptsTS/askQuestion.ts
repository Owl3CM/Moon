import readline from "readline";
import util from "util";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const asyncQuestion = util.promisify(rl.question).bind(rl);

export const closeRl = () => rl.close();

export const askQuestions = async (questions: Record<string, any>) => {
    for (const question of Object.values(questions)) {
        question.answer = await askQuestion(question);
    }
};

export const askQuestion = async ({ question }: { question: string }) => ((await asyncQuestion(`${question} ? y/n  `)) as any) !== "n";
