const axios = require('axios');
const xml = require('xmlbuilder');

const ADOPTIUM_API_URL = 'https://api.adoptium.net/v3/info/release_names?release_type=ga';
const schemaString = 'http://scap.nist.gov/schema/cpe-extension/2.3 https://scap.nist.gov/schema/cpe/2.3/cpe-dictionary-extension_2.3.xsd http://cpe.mitre.org/dictionary/2.0 https://scap.nist.gov/schema/cpe/2.3/cpe-dictionary_2.3.xsd http://scap.nist.gov/schema/cpe-dictionary-metadata/0.2 https://scap.nist.gov/schema/cpe/2.1/cpe-dictionary-metadata_0.2.xsd http://scap.nist.gov/schema/scap-core/0.3 https://scap.nist.gov/schema/nvd/scap-core_0.3.xsd http://scap.nist.gov/schema/configuration/0.1 https://scap.nist.gov/schema/nvd/configuration_0.1.xsd http://scap.nist.gov/schema/scap-core/0.1 https://scap.nist.gov/schema/nvd/scap-core_0.1.xsd';

async function fetchAllReleases() {
    let page = 0;
    const pageSize = 20;
    let releases = [];
    let hasNextPage = true;

    while (hasNextPage) {
        try {
            const response = await axios.get(`${ADOPTIUM_API_URL}&page=${page}&page_size=${pageSize}`);
            if (response.data && response.data.releases && response.data.releases.length > 0) {
                releases = releases.concat(response.data.releases);
                page++;
            } else {
                hasNextPage = false;
            }
        } catch (error) {
            // This error likely indicates that the page doesn't exist.
            // We'll stop the loop and proceed with the releases we have.
            hasNextPage = false;
        }
    }
    return releases;
}

function generateCPEDirectory(releases) {
    const root = xml.create('cpe-list', {
        version: '1.0',
        encoding: 'UTF-8'
    });

    // Add other required namespaces here...
    root.att('xmlns:config', 'http://scap.nist.gov/schema/configuration/0.1');
    root.att('xmlns', 'http://cpe.mitre.org/dictionary/2.0');
    root.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    root.att('xmlns:cap-core', 'http://scap.nist.gov/schema/scap-core/0.3');
    root.att('xmlns:cpe-23', 'http://scap.nist.gov/schema/cpe-extension/2.3');
    root.att('xmlns:ns6', 'http://scap.nist.gov/schema/scap-core/0.1');
    root.att('xmlns:meta', 'http://scap.nist.gov/schema/cpe-dictionary-metadata/0.2');
    root.att('xsi:schemaLocation', schemaString);

    releases.forEach(release => {
        // regex to convert jdk-20.0.2+9 into 20.0.2 or 11.0.14.1+1 into 11.0.14.1
        let version = release.replace(/\+.*$/, '').replace(/jdk-/, '');
        // regex to remove convert jdk-20.0.2+9 into 20.0.2+9
        let titleVersion = release.replace(/jdk-/, '');
        // convert jdk-20.0.2+9 into url encoded jdk-20.0.2%2B9
        const urlEncodedVersion = encodeURIComponent(release);
        // fetch major version from jdk-20.0.2+9 or jdk8u345-b01
        let majorVersion = release.replace(/jdk-([0-9]+)\..*/, '$1');
        if (version.startsWith('jdk8u')) {
            majorVersion = '8';
            // convert jdk8u302-b08 into 1.8.0:u302
            const uVersionNumber = version.replace(/jdk8u([0-9]+).*/, '$1');
            version = `1.8.0:update_${uVersionNumber}`;
            // if a respin such as jdk8u342-b07.1 add the .1 to the version
            if (release.split('-')[1].split('.').length > 1) {
                version = `${version}.${release.split('-')[1].split('.')[1]}`;
            }
            titleVersion = urlEncodedVersion.replace(/jdk/, '');
        } else if (release.split('+')[1].split('.').length > 1) {
            // detect an 11+ respin e.g 11.0.12+7.1 and convert to 11.0.12.1
            version = `${version}.${release.split('+')[1].split('.')[1]}`;
        }
        // if major version is something like jdk-20+36 we need to convert it to 20
        if (majorVersion.includes('+')) {
            majorVersion = majorVersion.split('+')[0].replace(/jdk-/, '');
        }

        const item = root.ele('cpe-item', { name: `cpe:/a:eclipse:temurin:${version}` });
        item.ele('title', { 'xml:lang': 'en-US' }, `Eclipse Temurin ${titleVersion}`);
        
        const references = item.ele('references');
        references.ele('reference', { href: `https://github.com/adoptium/temurin${majorVersion}-binaries/releases/tag/${urlEncodedVersion}` }, 'artifacts');
        references.ele('reference', { href: 'https://adoptium.net/temurin' }, 'website');
        references.ele('reference', { href: 'https://eclipse.org' }, 'vendor');
        let string = `cpe:2.3:a:eclipse:temurin:${version}:*:*:*:*:*:*:*`
        if (version.includes(':')) {
            string = `cpe:2.3:a:eclipse:temurin:${version}:*:*:*:*:*:*`
        }
        item.ele('cpe-23:cpe23-item', { name: string });
    });

    return root.end({ pretty: true });
}

(async () => {
    const releases = await fetchAllReleases();
    const xmlString = generateCPEDirectory(releases);
    console.log(xmlString);
})();
