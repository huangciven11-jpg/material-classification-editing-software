# Claude Handoff

## Project Root
- `E:\codex\新建文件夹`

## Important Rule
- Only work in this directory.
- Do not switch back to `E:\codex\zhinjian-clone`.
- Treat this folder as the real project source of truth.

## Product Output
- Current runnable build:
  `E:\codex\新建文件夹\release\win-unpacked\素材分类剪辑软件.exe`

## Package Scripts
- Dev renderer: `npm run dev:renderer`
- Dev app: `npm run dev`
- Build renderer: `npm run build`
- Build electron: `npm run build:electron`
- Package app: `npm run dist`
- Fresh package: `npm run dist:fresh`
- Tests: `npm run test`
- Lint: `npm run lint`

## Current Goal
- Continue improving the desktop software in this folder.
- Focus on real code changes, verification, and packaging.
- Prefer direct execution over repeated confirmation prompts.
- Use your own best recommendation for the next highest-value task, then continue from there without waiting.

## Restart Instructions
When Claude is restarted, resume with this exact context:

1. The active project is `E:\codex\新建文件夹`.
2. The current packaged app is `release\win-unpacked\素材分类剪辑软件.exe`.
3. Continue improving this software instead of re-discovering the project.
4. Inspect current code, run or verify relevant commands, then keep implementing.
5. After finishing one task, immediately choose the next best task and continue.

## Suggested First Checks After Restart
- Open `package.json`
- Inspect `src` and `electron`
- Check `release\win-unpacked`
- Run the relevant build/test command only if needed for the next step
