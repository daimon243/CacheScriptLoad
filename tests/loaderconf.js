var loaderconf = {
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
                cache: 2
            }
        }
    },
    onLoad: function () {
        console.log('call callback !!!');
        console.log('load end ', window.loader.getcfg());
        // delete window.loader;
    }
};
