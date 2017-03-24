# Load and cache scripts and styles
The given script is intended for loading and caching js and css files in local storage.
Tested with Chrome, Firefox, Opera, Safari, IE 7,8,9,10, Edge

The cache is controlled based on the version of the flies and the variants of the caching.
### There are three options for caching files:
	0: no cache
	1: cache, but if the file is not in the cache or the version of the file does not match,
		then the file is downloaded twice, once with a regular browser method and the second time
		through Ajax in the cache;
	2: cache, but use only through the cache. First, the file is loaded into the cache, and then
		injected into the DOM. Thus, the file is loaded only once.
Variants 0 and 1 are used for the convenience of debugging development tools in browsers,
option 2 for production.        

The load () method, which directly starts the boot process, takes two parameters, two configurations
whose structure is identical, but if both parameters are passed, then the configs first merging, and
in the resulting config the parameters in the first config have a higher weight, i.e. if the equals
keys in first and second config, the values ​​are taken from the first configuration, if the keys are
different then the resulting configuration will have the data of both the first and second configurations.
This feature is implemented to ensure the scalability of the project, of which the script is a part.         

Loading is carried out in two stages. At the first stage, a file with versions of scripts and styles is
loaded, in the second stage files with versions of which do not correspond to the versions of files in the
cache are downloaded.

The order of file downloads can be changed by specifying files in the properties after which files can
start the download.

At the end of the download, the callback () specified in the configuration file is executed.

The source code is written in accordance with the requirements of es6. This implementation was written
to use obfuscation of code closure compiler from google, with ADVANCED_OPTIMIZATIONS, es6 -> es5.

### simple usage:
	<!DOCTYPE html>
	<html>
	<head>
	<title>Test Load And Cache Scripts And Styles</title>
	<script src="release/loader-min.js"></script>
	<script type="text/javascript">
	loader.load({
	  modules: {
	    conf1: {
	      load: {
	        url: 'tests/loaderconf.js',
	        version: '0',
	        cache: 0
	      }
	    }
	  },
	  onLoad: () => {
	    console.log('config loaded ', loader.getcfg());
	    loader.load(loaderconf);
	  }
	}, null);
	</script>
	</head>
	<body>
	</body>
	</html>
### example tests/loaderconf.js
	let loaderconf = {
      modules: {
        script1: {
            load: {
                url: 'tests/script1.js',
                version: '0.0.1',
                cache: 0
            }
        },
        script2: {
            load: {
                url: 'tests/script2.js',
                version: '0.0.1',
                cache: 1
            }
        },
        script3: {
            load: {
                url: 'tests/script3.js',
                version: '0.0.1',
                cache: 2,
                after:[ 'script4', 'script2' ]
            }
        },
        script4: {
            load: {
                url: 'tests/script4.js',
                version: '0.0.1',
                cache: 0
            }
        },
        style1: {
            load: {
                url: 'styles/test.css',
                version: '0.0.1',
                cache: 0
            }
        },
      },
      onLoad: () => {
        console.log('call callback !!!');
        console.log('load end ', window.loader.getcfg());
        delete window.loader;
      }
	};
---	

More detailed information can be found in the folder doc.

---

### License
ISC © daimon243@gmail.com, Dmitry Teikovtcev, Dnepr, Ukraine
