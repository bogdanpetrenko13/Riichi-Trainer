# Debug signing key

`debug.keystore` is a plain Android debug key with the public credentials
(store and key password `android`, alias `androiddebugkey`). It is committed
on purpose: every CI build is signed with the same key, so a new debug APK
installs over the previous one without uninstalling.

Never use it for release builds.
