# How to rebase this repo on top of the original

Step 1: Add the remote (original repo that you forked) and call it “upstream”

_Note: You'll only need to add this remote once on your machine_

```
git remote add upstream https://github.com/hashgraph/hedera-mirror-node-explorer.git
```

Step 2: Fetch all branches of remote `upstream`

```
git fetch upstream
```

Step 3: Rewrite your main with upstream’s main using git rebase.

```
git rebase upstream/main
```

Step 4: Push your updates to main. You may need to force the push with “--force”.

```
git push origin main --force
```
