0.1.15 (6/29/2015)
-------------------
  * Fix for [TIMOB-19090](https://jira.appcelerator.org/browse/TIMOB-19090) - Windows: Building for ws-local fails with powershell error 'Read-Host : Windows PowerShell is in NonInteractive mode'
  * Install of winstore app script requires not using the -NoInteractive flag to powershell.

0.1.14 (6/25/2015)
-------------------
  * More changes related to fixing [TIMOB-18958](https://jira.appcelerator.org/browse/TIMOB-18958) - Windows: CLI builds hang on first try due to Powershell permission check in windowslib

0.1.13 (6/11/2015)
-------------------
  * Expand cert utility functionality
  * Fix for winstore app install method

0.1.12 (6/9/2015)
-------------------
  * Fix [TIMOB-18958](https://jira.appcelerator.org/browse/TIMOB-18958) - Windows: CLI builds hang on first try due to Powershell permission check in windowslib
  * Expand Win Store Tooling Detection

0.1.11 (4/16/2015)
-------------------
  * Fix [TIMOB-18822](https://jira.appcelerator.org/browse/TIMOB-18822) - Added check so that os name and powershell info is only detected on Windows 8 or newer.

0.1.10 (3/18/2015)
-------------------
  * Fix [TIMOB-18706](https://jira.appcelerator.org/browse/TIMOB-18706) - Error when Windows Phone SDK is NOT installed

0.1.9 (2/25/2015)
-------------------
 * Update to node-appc 0.2.24

0.1.8 (2/23/2015)
-------------------
 * Fix issues launching phone emulator seen on some setups/foreign languages

0.1.7 (1/8/2015)
-------------------
 * Remove use of custom wptool, defer to deploy cmd for launch/connect [TIMOB-18303]
 * Surface exact error message from deploy command on failure (Issue #5)

0.1.6 (12/16/2014)
-------------------
 * Minor fix for surfacing errors in wptool.js, wrong variable name referenced.

0.1.5 (12/05/2014)
-------------------
 * Made wstool launch of WinStore apps more robust

0.1.4 (12/03/2014)
-------------------
 * Detects Visual Studio Express editions and have a better error reporting when Visual Studio is not found
 * Added missing node-appc reference in the index.js

0.1.3 (12/01/2014)
-------------------
 * add option to skipLaunch when installing Windows Phone app

0.1.2 (11/25/2014)
-------------------
 * Added detection of the XapSignTool executable

0.1.1 (11/12/2014)
-------------------
 * Fixed bug with installing Windows Store apps

0.1.0 (11/12/2014)
-------------------
 * Initial release of windowslib
 * Supports launching Windows Phone emulators, install apps to emulators and
   devices, log output, cert generation, development environment detection
   and much, much more [TIMOB-17515]
