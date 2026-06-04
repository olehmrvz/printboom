# Contributing to Printboom

Thank you for your interest in contributing to Printboom! We welcome contributions from developers of all skill levels to help make this collage-making and print design application even better.

## How to Contribute

### 1. Report Bugs or Request Features
If you find a bug or have a feature request, please open an issue on GitHub. Please check existing issues first to avoid duplicates.

### 2. Working on Code Changes

To contribute code:

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/printboom.git
   cd printboom
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/your-bug-fix
   ```
5. **Run the local development server**:
   ```bash
   npm run dev
   ```
6. **Make your changes**. Ensure that you follow the project's styling and structure:
   - Next.js with App Router
   - TailwindCSS v4 for styling
   - Zustand for state management
   - react-konva for canvas features
   - TypeScript for strict typing
7. **Run lints and tests** to ensure code quality:
   ```bash
   npm run lint
   npm run build
   ```
8. **Commit and push** your changes:
   ```bash
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```
9. **Submit a Pull Request** to the `main` branch of the original repository.

## Code of Conduct

Please be respectful and constructive in all your communications and contributions.

## License

By contributing to Printboom, you agree that your contributions will be licensed under the project's MIT License.
