export declare const Controller: {
    createStyles: () => Promise<void>;
    init: (config: any) => Promise<void>;
    config: {
        themes: {
            root: {};
            light: {};
            dark: {};
        };
        styles: {
            props: {
                padding: string;
                margin: string;
                gap: string;
                inset: string;
                top: string;
                left: string;
                right: string;
                bottom: string;
            };
            variableName: string;
            values: {
                "0": string;
                xs: string;
                sm: string;
                md: string;
                lg: string;
                xl: string;
                "2x": string;
                "3x": string;
                "4x": string;
                "5x": string;
                "6x": string;
            };
        }[];
        outputPath: string;
        useStaticNumbers: boolean;
    };
};
