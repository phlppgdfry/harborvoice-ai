# GitHub cleanup

17 November 2026.

| Item                                                                         | Action                                  | Evidence                                                                                            |
| ---------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `feat/creative-community-finalization`                                       | **Deleted** locally and on GitHub       | 0 commits not on main; local = remote `c3644c6`; PR #8 merged                                       |
| `docs/creative-community-closeout`                                           | **Deleted** locally and on GitHub       | 0 commits not on main; local = remote `ae9057d`; PR #9 merged                                       |
| Worktree `~/harborvoice-creative-community`                                  | **Removed**                             | No uncommitted or untracked files; ignored files were only dependencies and build output            |
| `production/persistent-runtime` + worktree `~/harborvoice-production-review` | **Kept**                                | Holds the private production configuration and operator files needed for the login fix and recovery |
| `feat/final-closeout` + worktree `~/harborvoice-final-closeout`              | This task's branch; delete after merge  | see final release evidence                                                                          |
| Labels `feedback`, `learn`, `workshop`                                       | Created earlier so the issue forms work |                                                                                                     |

Releases and tags are unchanged; nothing was force-pushed. Repository settings (branch protection, Dependabot) are recorded in [final-release-evidence.md](final-release-evidence.md).
