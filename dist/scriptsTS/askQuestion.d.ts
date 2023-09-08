export declare const closeRl: () => void;
export declare const askQuestions: (questions: Record<string, any>) => Promise<void>;
export declare const askQuestion: ({ question }: {
    question: string;
}) => Promise<boolean>;
