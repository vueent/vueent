import { Config as Configuration } from 'bili';

const configuration: Configuration = {
  banner: true,
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['es', 'cjs'],
    sourceMap: true
  },
  plugins: {
    typescript2: {
      clean: true,
      tsconfig: 'tsconfig.bundle.json'
    }
  }
};

export default configuration;
