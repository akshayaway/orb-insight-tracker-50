# Building a signed AAB and publishing to Google Play

This document collects the exact commands and steps to produce a signed Android App Bundle (AAB) from this Capacitor project and upload it to the Play Console.

Prerequisites (local machine)
- Java JDK (17+ recommended). Set JAVA_HOME to the JDK install folder.
- Android SDK (installed via Android Studio or command-line). Ensure ANDROID_SDK_ROOT or ANDROID_HOME is set and platform-tools are on PATH.
- Android Studio (recommended) for signing UI and testing.

Quick checklist
1. Create a release keystore (if you don't have one). Example (PowerShell):

```powershell
cd 'C:\Program Files\Java\jdk-17\bin'
# Run this from PowerShell (change alias/password/path as needed)
keytool -genkeypair -v -keystore C:\Users\<you>\keystore.jks -alias propjournalkey -keyalg RSA -keysize 2048 -validity 10000
```

2. Copy your keystore into the android project (or keep it outside and provide absolute path). Create `android/keystore.properties` with these keys:

```
storeFile=keystore.jks
storePassword=your_store_password
keyAlias=your_key_alias
keyPassword=your_key_password
```

3. Build web assets and copy into native project:

```powershell
cd 'C:\Users\Hello\Downloads\propfirm-knowledge-journal-main'
npm run build
npx cap copy android
```

4. Build the signed AAB (Gradle will pick up `android/keystore.properties` if present):

```powershell
cd 'C:\Users\Hello\Downloads\propfirm-knowledge-journal-main\android'
.\gradlew bundleRelease
```

The produced AAB will be in `android/app/build/outputs/bundle/release/app-release.aab`.

5. Upload the AAB to Google Play Console and follow the release steps.

Notes and security
- Do NOT commit `android/keystore.properties` or your keystore to source control. Add them to `.gitignore` if needed.
- If you prefer Android Studio UI: run `npx cap open android` then use Build > Generate Signed Bundle/APK...
- If you encounter SDK/JDK errors, ensure environment variables (`JAVA_HOME`, `ANDROID_SDK_ROOT`) are correctly set and command-line tools are installed.
