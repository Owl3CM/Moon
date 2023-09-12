module.exports = {
  // Specify the paths to the HTML files where PurgeCSS will look for classes to keep.
  content: ["./src/**/*.{html,js,jsx,tsx}"],
  // Specify the CSS files that you want PurgeCSS to analyze and remove unused CSS from.
  css: ["./dist/**/*.css"],
  // Optionally, you can add more options to fine-tune PurgeCSS behavior.
  // For example, you can specify additional classes to keep or ignore.
  // For a complete list of options, see the PurgeCSS documentation: https://purgecss.com/configuration.html
  // Example:
  // options: {
  //   safelist: ['custom-class-1', 'custom-class-2'],
  //   // Add more options here as needed.
  // },
  // Define the path where the purged CSS will be saved.
  // PurgeCSS will write the optimized CSS to this file.
  // Make sure to configure this path according to your project's structure.
  output: "./dist/optimized.css",
  // You can add other options here as needed.
};
