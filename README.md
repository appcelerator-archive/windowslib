# Windows Utility Library

A suite of Windows development-related functions.

## Installation

	npm install windowslib

## API

 * [OS](#os)
 * [Visual Studio](#visual-studio)
 * [Windows SDKs](#windows-sdks)
 * [vswhere](#vswhere)
 * [certs](#certs)

### OS

#### `os.name`

Retrieves the operating system name.

Returns a `String`.

```js
import { os } from 'windowslib';

console.log(os.name);
```

```
Microsoft Windows 10 Home Single Language
```

#### `os.version`

Retrieves the operating system version.

Returns a `String`.

```js
import { os } from 'windowslib';

console.log(os.version);
```

```
10.0.17763
```

### Visual Studio

#### `getVisualStudios(opts)`

| Argument     | Type    | Description      | Default |
| ------------ | ------- | ---------------- | ------- |
| `opts`       | Object  | Various options. | |
| `opts.all`   | Boolean | When `true`, returns all Visual Studio installations regardless if they are "complete". | `false` |
| `opts.force` | Boolean | When `true`, bypasses cache and forces redetection. | `false` |

Returns a `Promise` that resolves `Array` of `windowslib.vs.VisualStudio` objects.

```js
import windowslib from 'windowslib';

const { getVisualStudios } = windowslib.vs;

console.log(await getVisualStudios());
```

```sh
[
  VisualStudio {
    complete: true,
    msbuild: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\MSBuild\\15.0\\Bin\\MSBuild.exe',
    name: 'Visual Studio Community 2017',
    path: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community',
    productId: 'Microsoft.VisualStudio.Product.Community',
    version: '15.9.28307.665',
    vsdevcmd: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\Common7\\Tools\\VsDevCmd.bat'
  },
  VisualStudio {
    complete: true,
    msbuild: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe',
    name: 'Visual Studio Community 2019',
    path: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community',
    productId: 'Microsoft.VisualStudio.Product.Community',
    version: '16.1.28917.181',
    vsdevcmd: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\Common7\\Tools\\VsDevCmd.bat'
  }
]
```

### Windows SDKs

Windows SDKs are installed by Visual Studio, but live outside Visual Studio. Furthermore, a Windows
SDK can contain multiple revisions. This API allows you to scan a directory for Windows SDKs or
a list of directories derived from values in the Windows Registry to scan for Windows SDKs.

#### `detectSDKs(dir)`

Detects Windows SDKs in a specific directory.

| Argument  | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| `dir`     | String  | A path to scan for Windows SDKs. |

Returns an `Array` of `windowslib.sdk.SDK` objects.

```js
import windowslib from 'windowslib';

const sdks = windowslib.sdk.detectSDKs('/path/to/windows/sdk');

console.log(sdks);
```

```sh
[
  SDK {
    majorVersion: 10,
    version: '10.0.17763.0',
    binDir: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0',
    includeDir: 'C:\\Program Files (x86)\\Windows Kits\\10\\Include\\10.0.17763.0',
    platformsDir: 'C:\\Program Files (x86)\\Windows Kits\\10\\Platforms\\UAP\\10.0.17763.0',
    executables: {
      makecert: {
        arm: null,
        arm64: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0\\arm64\\makecert.exe',
        x86: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0\\x86\\makecert.exe',
        x64: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0\\x64\\makecert.exe'
      },
      pvk2pfx: {
        arm: null,
        arm64: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0\\arm64\\pvk2pfx.exe',
        x86: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0\\x86\\pvk2pfx.exe',
        x64: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0\\x64\\pvk2pfx.exe'
      }
    },
    name: 'Windows 10, version 1809',
    minVSVersion: '15.0.25909.02'
  }
]
```

#### `getWindowsSDKs(force)`

Gets Windows SDKs based on the default path in addition to paths derived from values in the Windows
Registry.

| Argument  | Type    | Description                                         | Default |
| --------- | ------- | --------------------------------------------------- | ------- |
| `force`   | Boolean | When `true`, bypasses cache and forces redetection. | `false` |

Returns a `Promise` that resolves an `Array` of `windowslib.sdk.SDK` objects.

```js
import windowslib from 'windowslib';

const sdks = await windowslib.sdk.getWindowsSDKs();

console.log(sdks);
```

```sh
?
```

### vswhere

_vswhere_ is a tool developed by Microsoft for locating Visual Studio installations. It's
distributed with Visual Studio 2017 15.2. windowslib exposes an API that attempts to locate
_vswhere_. It is used by windowslib's Visual Studio API, but you can use it directly.

```js
import windowslib from 'windowslib';

const vswhere = await windowslib.vswhere.getVSWhere();
console.log(vswhere);
```

```sh
VSWhere {
	exe: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe'
}
```

```js
const products = await vswhere.query();
```

```sh
[
  {
    instanceId: '07c9e7e5',
    installDate: '2019-04-25T20:47:12Z',
    installationName: 'VisualStudio/15.9.12+28307.665',
    installationPath: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community',
    installationVersion: '15.9.28307.665',
    productId: 'Microsoft.VisualStudio.Product.Community',
    productPath: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\Common7\\IDE\\devenv.exe',
    state: 4294967295,
    isComplete: true,
    isLaunchable: true,
    isPrerelease: false,
    isRebootRequired: false,
    displayName: 'Visual Studio Community 2017',
    description: 'Free, fully-featured IDE for students, open-source and individual developers',
    channelId: 'VisualStudio.15.Release',
    channelUri: 'https://aka.ms/vs/15/release/channel',
    enginePath: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\resources\\app\\ServiceHub\\Services\\Microsoft.VisualStudio.Setup.Service',
    releaseNotes: 'https://go.microsoft.com/fwlink/?LinkId=660692#15.9.12',
    thirdPartyNotices: 'https://go.microsoft.com/fwlink/?LinkId=660708',
    updateDate: '2019-05-23T18:27:39.6289144Z',
    catalog: {
      buildBranch: 'd15.9',
      buildVersion: '15.9.28307.665',
      id: 'VisualStudio/15.9.12+28307.665',
      localBuild: 'build-lab',
      manifestName: 'VisualStudio',
      manifestType: 'installer',
      productDisplayVersion: '15.9.12',
      productLine: 'Dev15',
      productLineVersion: '2017',
      productMilestone: 'RTW',
      productMilestoneIsPreRelease: 'False',
      productName: 'Visual Studio',
      productPatchVersion: '12',
      productPreReleaseMilestoneSuffix: '1.0',
      productRelease: 'RTW',
      productSemanticVersion: '15.9.12+28307.665',
      requiredEngineVersion: '1.18.1049.33485'
    },
    properties: {
      campaignId: '13132988.1488924318',
      channelManifestId: 'VisualStudio.15.Release/15.9.12+28307.665',
      nickname: '',
      setupEngineFilePath: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vs_installershell.exe'
    }
  }
]
```

### Certs

Not implemented yet.

## License

This project is open source under the [Apache Public License v2][1] and is developed by
[Axway, Inc](http://www.axway.com/) and the community. Please read the [`LICENSE`][1] file included
in this distribution for more information.

[1]: https://github.com/appcelerator/windowslib/blob/master/LICENSE
