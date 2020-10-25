module.exports = {
  'packages/*/src/**/*.{js,ts,vue}': ['prettier --write', 'eslint --max-warnings=0', 'git add']
};
