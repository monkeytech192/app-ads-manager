# Contributing to Ads Manager

First off, thank you for considering contributing to Ads Manager! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- **Clear title and description**
- **Use case and motivation**
- **Possible implementation** if you have ideas

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make changes** and test thoroughly
4. **Follow code style** (use Prettier: `npm run format`)
5. **Write good commit messages**
6. **Update documentation** if needed
7. **Open a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/app-ads-manager.git
cd app-ads-manager

# Install dependencies
npm install
cd backend && npm install

# Setup environment
cp .env.example .env
cp backend/.env.example backend/.env

# Run dev servers
npm run dev              # Frontend
cd backend && npm run dev # Backend
```

## Code Style

- Use **TypeScript** for all new files
- Follow **existing code patterns**
- Use **functional components** with hooks
- Write **meaningful variable names**
- Add **comments** for complex logic
- Format code with **Prettier**

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Example: `feat: Add Facebook campaign analytics endpoint`

## Testing

- Test your changes locally
- Ensure no console errors
- Test on multiple browsers if UI changes
- Test API endpoints with tools like Postman

## Questions?

Feel free to:
- Open an issue for discussion
- Reach out to maintainers
- Check existing documentation

Thank you for contributing! ❤️
