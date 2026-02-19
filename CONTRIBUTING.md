# Contributing to Mouseion

Thank you for your interest in contributing to Mouseion! This document provides guidelines and information for contributors.

[日本語版](#日本語)

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
- Check the issue tracker to avoid duplicates
- Collect information about the bug (steps to reproduce, expected vs actual behavior)

When submitting:
- Use a clear and descriptive title
- Describe the exact steps to reproduce
- Provide specific examples
- Include system information if relevant

### Suggesting Features

- Check existing issues and discussions first
- Clearly describe the feature and its use case
- Explain why this would be useful to most users

### Code Contributions

We welcome code contributions! Here are some ways to help:

- **Good First Issues**: Look for issues labeled `good first issue`
- **Documentation**: Improve or translate documentation
- **Tests**: Add or improve test coverage
- **Bug Fixes**: Fix reported issues
- **Features**: Implement new features (discuss first in an issue)

## Getting Started

### Prerequisites

- Git
- TypeScript (for blockchain development)
- Node.js (for web components, when applicable)

### Setting Up Development Environment

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/mouseion.git
cd mouseion

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/mouseion.git

# Create a branch for your work
git checkout -b feature/your-feature-name
```

## Development Process

1. **Pick an Issue**: Find an issue to work on or create one
2. **Discuss**: For significant changes, discuss your approach first
3. **Branch**: Create a feature branch from `main`
4. **Code**: Make your changes
5. **Test**: Ensure tests pass
6. **Commit**: Write clear commit messages
7. **Push**: Push to your fork
8. **PR**: Open a Pull Request

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated if needed
- [ ] Commit messages are clear and descriptive

### PR Title Format

Use conventional commit format:
- `feat: add new feature`
- `fix: resolve bug in X`
- `docs: update README`
- `test: add tests for Y`
- `refactor: restructure Z`

### PR Description

Include:
- Summary of changes
- Related issue number (e.g., "Closes #123")
- Testing done
- Screenshots if UI changes

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge

## Style Guidelines

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and PRs in the body

### Code Style

- Follow existing code conventions in the project
- Add comments for complex logic
- Keep functions focused and small
- Write self-documenting code when possible

### Documentation

- Use Markdown for documentation
- Keep language clear and concise
- Include examples where helpful
- Update documentation with code changes

## Questions?

Feel free to open an issue for any questions about contributing.

---

# 日本語

## Mouseionへの貢献

Mouseionへの貢献に興味を持っていただきありがとうございます！

## 行動規範

このプロジェクトは[行動規範](./CODE_OF_CONDUCT.md)に従います。参加することで、この規範を守ることに同意したものとみなされます。

## 貢献の方法

### バグ報告

- 既存のIssueを確認して重複を避けてください
- 再現手順、期待される動作、実際の動作を記載してください

### 機能提案

- 既存のIssueやDiscussionを確認してください
- 機能とそのユースケースを明確に説明してください

### コード貢献

- `good first issue`ラベルのIssueから始めることをお勧めします
- ドキュメントの改善や翻訳
- テストの追加
- バグ修正
- 新機能の実装（事前にIssueで議論してください）

## 開発プロセス

1. Issueを選ぶまたは作成
2. 大きな変更の場合は事前に議論
3. `main`からブランチを作成
4. 変更を加える
5. テストを実行
6. 明確なコミットメッセージを書く
7. フォークにプッシュ
8. プルリクエストを開く

## プルリクエストの手順

- コードがスタイルガイドに従っているか確認
- テストが通るか確認
- 必要に応じてドキュメントを更新
- 明確なコミットメッセージを書く

## 質問がありますか？

貢献に関する質問は、Issueを開いてお気軽にどうぞ。
