# 3.1.0 (Dec 1, 2020)

 * chore: Updated dependencies.

# 3.0.0 (Jun 5, 2020)

 * BREAKING CHANGE: Requires Node.js 10.13.0 or newer.
   [(DAEMON-334)](https://jira.appcelerator.org/browse/DAEMON-334)
 * chore: Updated dependencies.

# 2.1.2 (Jan 8, 2020)

 * chore: Updated dependencies.

# 2.1.1 (Nov 7, 2019)

 * chore: Updated dependencies.

# 2.1.0 (Aug 14, 2019)

 * chore: Bumped minimum required Node.js version from v8.10.0 to v8.12.0. While this would
   technically be considered a breaking change, `windowslib` depends on `winreglib` which already
   mandates the forementioned Node.js minimums.
 * chore: Updated dependencies.

# 2.0.2 (Jul 12, 2019)

 * chore: Updated dependencies.

# 2.0.1 (Jul 1, 2019)

 * chore: Updated dependencies.

# 2.0.0 (Jun 4, 2019)

 * BREAKING CHANGE: Initial release of the v2 rewrite with completely new API.
 * refactor: Updated code to ES2015.

___________________________________________________________________________________________________

> Note: The following releases and changes are not applicable to `windowslib` v2 or newer and are
> presented below for historical reasons. The source for `windowslib@0.x` can be found at
> https://github.com/appcelerator/windowslib/tree/0_X.

# 0.6.8 (Jan 29, 2019)

  * Fix deployment issue with "violates pattern constraint of bms-resource". ([TIMOB-24422](
    https://jira.appcelerator.org/browse/TIMOB-24422))

# 0.6.7 (Jun 13, 2018)

  * Update .npmignore to avoid including test files, other unnecessary files in release.

# 0.6.6 (Jun 13, 2018)

  * Update npm dependencies.

# 0.6.5 (Mar 5, 2018)

  * Fix error when fresh install with `forceUnInstall`. ([TIMOB-25827](
    https://jira.appcelerator.org/browse/TIMOB-25827))

# 0.6.4 (Jan 30, 2017)

  * Don't `forceUnInstall` unless user explicitly specifies it. ([TIMOB-25616](
    https://jira.appcelerator.org/browse/TIMOB-25616))

# 0.6.3 (Nov 27, 2017)

  * Remove unnecessary quote when building project. ([DAEMON-184](
    https://jira.appcelerator.org/browse/DAEMON-184))

# 0.6.2 (Nov 27, 2017)

  * Wrap project name in quotes when building a project. ([DAEMON-184](
    https://jira.appcelerator.org/browse/DAEMON-184))

# 0.6.1 (Nov 21, 2017)

  * Handle max path when building wptool. ([DAEMON-165](
    https://jira.appcelerator.org/browse/DAEMON-165))

# 0.6.0 (Oct 5, 2017)

  * Only detect emulators based off the optional supportedWindowsPhoneSDKVersions parameter.
    ([TIMOB-25027](https://jira.appcelerator.org/browse/TIMOB-25027))
  * Add coverage gathering.

# 0.5.5 (Sep 7, 2017)

  * Make sure to catch JSON.parse errors. ([TIMOB-25232](
    https://jira.appcelerator.org/browse/TIMOB-25232))

# 0.5.4 (Aug 15, 2017)

  * Fix detection of SDK specific winappdeploycmd. ([TIMOB-24958](
    https://jira.appcelerator.org/browse/TIMOB-24958))

# 0.5.3 (Aug 9, 2017)

  * Must call the callback with an object like `{devices:[], emulator:[]}`. ([TIMOB-24683](
    https://jira.appcelerator.org/browse/TIMOB-24683))

# 0.5.2 (Jul 12, 2017)

  * Do not attempt to run winappdeploycmd if it does not exist. ([TIMOB-24683](
    https://jira.appcelerator.org/browse/TIMOB-24683))
  * Fix issue where temporary AppxManifest would not get written when fetching project guid.
    ([TIMOB-24956](https://jira.appcelerator.org/browse/TIMOB-24956))

# 0.5.1 (Jul 4, 2017)

  * Fix cert generation on VS2017 - Move to using vsDevCmd instead of vcvarsall. ([TIMOB-24922](
    https://jira.appcelerator.org/browse/TIMOB-24922))
  * Update VS2017 detection logic to prevent error with VS2015. ([TIMOB-24668](
    https://jira.appcelerator.org/browse/TIMOB-24668))

# 0.5.0 (May 9, 2017)

  * Add `emulator#status` to get numeric status of emulator.
  * Use status to poll emulator for running state (2) after launching but before installing app
  * Add type property to object describing emulator or device, with value 'emulator' or 'device'
  * re-use cached emulator listing inside emulator#isRunning and emulator#launch
  * Fix winstore unit test to work with various version of Microsoft.Photos app

# 0.4.30 (Apr 28, 2017)

  * Windows: Fails to install dependencies for app on Windows 10 Phone Emulator. ([TIMOB-24422](
    https://jira.appcelerator.org/browse/TIMOB-24422))
  * Remove os win32 restriction on package.json so we can install into titanium_mobile from
    non-Windows machines using yarn.
  * Avoid possible double-callback call on app install when also launching. If app installs ok but
    failed to launch, we'd fire two callbacks: one for the successful install and another for the
    failure. We still emit multiple events, but only fire the callback after launch when being
    asked to both install and launch.

# 0.4.29 (Mar 14, 2017)

  * Use VsDevCmd instead of vcvarsall. ([TIMOB-24189](
    https://jira.appcelerator.org/browse/TIMOB-24189))

# 0.4.28 (Feb 27, 2017)

  * Support Visual Studio 2017. ([TIMOB-24189](https://jira.appcelerator.org/browse/TIMOB-24189))

# 0.4.27 (Jan 3, 2017)

  * Failed to install WP 8.1 app. ([TIMOB-24183](https://jira.appcelerator.org/browse/TIMOB-24183))

# 0.4.26 (Dec 20, 2016)

  * Use `uuid` instead of `node-uuid`.

# 0.4.25 (Nov 24, 2016)

  * Enumerate should just move on even when no results with given version. ([TIMOB-23976](
    https://jira.appcelerator.org/browse/TIMOB-23976))

# 0.4.24 (Nov 22, 2016)

  * Install certificate in new window. ([TIMOB-24157](
    https://jira.appcelerator.org/browse/TIMOB-24157))

# 0.4.23 (Sep 16, 2016)

  * Terminate running app at launch. ([TIMOB-23879](
    https://jira.appcelerator.org/browse/TIMOB-23879))

# 0.4.22 (Sep 14, 2016)

  * Fix typo around preferred SDK. ([TIMOB-23661](
    https://jira.appcelerator.org/browse/TIMOB-23661))

# 0.4.21 (Aug 26, 2016)

  * Ability to skip windows phone detection. ([TIMOB-23834](
    https://jira.appcelerator.org/browse/TIMOB-23834))

# 0.4.20 (Aug 26, 2016)

  * Fix 8.1 emulator listing. ([TIMOB-23816](
    https://jira.appcelerator.org/browse/TIMOB-23816))

# 0.4.19 (Aug 23, 2016)

  * CLI hangs on install of app when a different app is installed. ([TIMOB-23800](
    https://jira.appcelerator.org/browse/TIMOB-23800))

# 0.4.18 (Aug 12, 2016)

  * Handle duplicate package error from Windows SDK 10.0.14393. ([TIMOB-23762](
    https://jira.appcelerator.org/browse/TIMOB-23762))

# 0.4.17 (Aug 12, 2016)

  * Detect installed Win10 SDK versions. ([TIMOB-23768](
    https://jira.appcelerator.org/browse/TIMOB-23768))

# 0.4.16 (Aug 9, 2016)

  * Fix: Failed to connect to WP 8.1 device. ([TIMOB-23748](
    https://jira.appcelerator.org/browse/TIMOB-23748))

# 0.4.15 (Jul 13, 2016)

  * Only report detected device. ([TIMOB-23279](
    https://jira.appcelerator.org/browse/TIMOB-23279))

# 0.4.14 (Jun 24, 2016)

  * `wptool.detect()` ignore errors when results are present. ([TIMOB-23484](
    https://jira.appcelerator.org/browse/TIMOB-23484))

# 0.4.13 (Apr 29, 2016)

  * Fix Windows Phone: Cannot read property 'split' of undefined. ([TIMOB-20376](
    https://jira.appcelerator.org/browse/TIMOB-20376))

# 0.4.12 (Apr 27, 2016)

  * Fix "TypeError: undefined is not a function" at Array.findIndex on Node.js 0.12.7.

# 0.4.11 (Apr 27, 2016)

  * Fix: `async.each` to `async.eachSeries`.

# 0.4.10 (Apr 27, 2016)

  * Windows: Build errors when building to device and selecting second option in device prompt.
    ([TIMOB-23253](https://jira.appcelerator.org/browse/TIMOB-23253))
  * Send separate installed and launched events for `wptool#install`, `device#install`,
    `emulator#install`, and `windowslib#install`.
  * We can tell if the app got installed but failed to launch (which I'm seeing repeatedly with my
    Windows 10 mobile device), allowing us to tell the user to launch the app manually.

# 0.4.9 (Apr 18, 2016)

  * Allow wptool to launch Windows 10 apps. ([TIMOB-20611](
    https://jira.appcelerator.org/browse/TIMOB-20611))

# 0.4.8 (Apr 14, 2016)

  * Combine device listings. ([TIMOB-20571](
    https://jira.appcelerator.org/browse/TIMOB-20571))

# 0.4.7 (Apr 13, 2016)

  * Add device version and wpsdk to enumerate. ([TIMOB-20571](
    https://jira.appcelerator.org/browse/TIMOB-20571))

# 0.4.6 (Apr 12, 2016)

  * Fix to force uninstall then install if first install fails because an existing version is
    already installed for Win 10 mobile. ([TIMOB-23181](
    https://jira.appcelerator.org/browse/TIMOB-23181))

# 0.4.5 (Apr 5, 2016)

  * Fix unescaped characters in vcvarsall. ([TIMOB-19673](
    https://jira.appcelerator.org/browse/TIMOB-19673))

# 0.4.4 (Mar 16, 2016)

  * Add support for Windows 10 devices. ([TIMOB-20566](
    https://jira.appcelerator.org/browse/TIMOB-20566))
  * Improve log output from certutil.

# 0.4.3 (Feb 17, 2016)

  * Another fix for uninstalling store apps from Windows 8.1.

# 0.4.2 (Feb 17, 2016)

  * Align dependencies with titanium_mobile.

# 0.4.1 (Feb 17, 2016)

  * When removing windows store package, properly pass along command (was broken on Windows 8.1).

# 0.4.0 (Feb 10, 2016)

  * Support enumerating devices using Windows 10 WinAppDeployCmd.
  * Make wstool print pid after launching Windows Store app sucessfully (as stdout).
  * Move common code to utilities.js for checking if wptool/wstool need to be rebuilt.
  * Add method for loopback ip network isolation exempting a Windows Store app by id/Name:
    `windowslib.winstore.loopbackExempt(appId, options, callback);`
  * Add method to get listing of Windows appx containers as JSON:
    `windowslib.winstore.getAppxPackages(options, callback);`
  * Fix broken wp_get_appx_metadata.ps1 file from newline mid-line.
  * Add method to find a process by pid: `windowslib.process.find(pid, options, callback);`

# 0.3.0 (Jan 6, 2016)

  * Support detection and use of Windows 10 SDK/tooling without requiring 8.1 tools installed.

# 0.2.2 (Dec 14, 2015)

  * Better error messages about bad app GUIDs when launching using our custom wptool.
  * Support appxbundles for extracting the app GUID, look in multiple locations in XML (still may
    get just the text appid and not GUID).
  * Support passing in the app GUID for the launch/install methods so we don't need to extract it
    from appx/appxbundle if we already know it.

# 0.2.1 (Dec 11, 2015)

  * Fix detection of Windows 10 phone details.

# 0.2.0 (Dec 10, 2015)

  * Add custom tooling for Win 10 mobile.
  * Support enumerating, launching and installing apps to Win 10 Mobile emulators.

# 0.1.22 (Dec 4, 2015)

  * Fix: Windows 10 Mobile detection ([PR 26](https://github.com/appcelerator/windowslib/pull/26)).

# 0.1.21 (Oct 29, 2015)

  * Fix: escape vcvarsall before subprocess.run. ([PR 25](
    https://github.com/appcelerator/windowslib/pull/25))

# 0.1.20 (Oct 13, 2015)

  * Windows: windowslib wstool doesn't launch on Windows 10. ([TIMOB-19693](
    https://jira.appcelerator.org/browse/TIMOB-19693))

# 0.1.19 (Oct 7, 2015)

  * Line up dependencies to match titanium_mobile's dependencies.

# 0.1.18 (Oct 7, 2015)

  * Remove error message for Windows Store deploy command. ([PR 23](
    https://github.com/appcelerator/windowslib/pull/23))
  * Fix: visualstudio.detect failed when install path contains space. ([PR 22](
    https://github.com/appcelerator/windowslib/pull/22))

# 0.1.17 (Sep 30, 2015)

  * Line up dependencies to match titanium_mobile's dependencies.

# 0.1.16 (Sep 30, 2015)

  * Add Windows 10 SDK as option, list Windows 10 emulators for 10/8.1. ([PR 21](
    https://github.com/appcelerator/windowslib/pull/21))

# 0.1.15 (Jun 29, 2015)

  * Fix for [TIMOB-19090](https://jira.appcelerator.org/browse/TIMOB-19090) - Windows: Building for
    ws-local fails with powershell error 'Read-Host : Windows PowerShell is in NonInteractive mode'.
  * Install of winstore app script requires not using the -NoInteractive flag to powershell.

# 0.1.14 (Jun 25, 2015)

  * More changes related to fixing [TIMOB-18958](https://jira.appcelerator.org/browse/TIMOB-18958) -
    Windows: CLI builds hang on first try due to Powershell permission check in windowslib.

# 0.1.13 (Jun 11, 2015)

  * Expand cert utility functionality.
  * Fix for winstore app install method.

# 0.1.12 (Jun 9, 2015)

  * Fix [TIMOB-18958](https://jira.appcelerator.org/browse/TIMOB-18958) - Windows: CLI builds hang
    on first try due to Powershell permission check in windowslib.
  * Expand Win Store Tooling Detection.

# 0.1.11 (Apr 16, 2015)

  * Fix [TIMOB-18822](https://jira.appcelerator.org/browse/TIMOB-18822) - Added check so that os
    name and powershell info is only detected on Windows 8 or newer.

# 0.1.10 (Mar 18, 2015)

  * Fix [TIMOB-18706](https://jira.appcelerator.org/browse/TIMOB-18706) - Error when Windows Phone
    SDK is NOT installed.

# 0.1.9 (Feb 25, 2015)

 * Update to node-appc 0.2.24.

# 0.1.8 (Feb 23, 2015)

 * Fix issues launching phone emulator seen on some setups/foreign languages.

# 0.1.7 (Jan 8, 2015)

 * Remove use of custom wptool, defer to deploy cmd for launch/connect. ([TIMOB-18303](
   https://jira.appcelerator.org/browse/TIMOB-18303))
 * Surface exact error message from deploy command on failure. ([Issue #5](
   https://github.com/appcelerator/windowslib/issues/5))

# 0.1.6 (Dec 16, 2014)

 * Minor fix for surfacing errors in wptool.js, wrong variable name referenced.

# 0.1.5 (Dec 05, 2014)

 * Made wstool launch of WinStore apps more robust.

# 0.1.4 (Dec 03, 2014)

 * Detects Visual Studio Express editions and have a better error reporting when Visual Studio is
   not found.
 * Added missing node-appc reference in the index.js.

# 0.1.3 (Dec 01, 2014)

 * add option to skipLaunch when installing Windows Phone app.

# 0.1.2 (Nov 25, 2014)

 * Added detection of the XapSignTool executable.

# 0.1.1 (Nov 12, 2014)

 * Fixed bug with installing Windows Store apps.

# 0.1.0 (Nov 12, 2014)

 * Initial release of windowslib.
 * Supports launching Windows Phone emulators, install apps to emulators and devices, log output,
   cert generation, development environment detection and much, much more. ([TIMOB-17515](
    https://jira.appcelerator.org/browse/TIMOB-17515))
