import { deleteFolder, readFile } from "./owlFs.js";
import { closeRl } from "./askQuestion.js";
import { Controller } from "./controller.js";

await Controller.init(JSON.parse(await readFile("./moonconfig.json")));
await Controller.createStyles();

// !args.includes("-ds") &&
deleteFolder("./scriptsJS");
closeRl();

// interface Question {
//   question: string;
//   answer: boolean;
// }
// Check if directory already exists
// if (args.some((o) => o === "-f") === false && (await fileExists(Controller.rootDir))) {
//   console.log(`\nDirectory '${Controller.rootDir}' already exists. Aborting.\n`);
//   const newQuestions = { override: { question: "override", answer: false } };
//   await askQuestions(newQuestions);
//   if (newQuestions.override.answer === false) process.exit(0);
// }

// if (args.some((o) => o === "-a") === false) await askQuestions(questions);
// export const questions: Record<string, Question> = {
//     addCss: { question: "add Css", answer: true },
//   };
//   export const hasCss = () => questions.addCss.answer;
