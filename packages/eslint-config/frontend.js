module.exports = {
  extends: ["./base", require.resolve("@vercel/style-guide/eslint/react")],
  env: {
    browser: true,
  },
  globals: {
    React: true,
    JSX: true,
  },
};
