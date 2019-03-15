// To install dependencies, run: npm install
const xmlbuilder = require('xmlbuilder');
// request-promise has a dependency on request
const rp = require('request-promise');
const fs = require('fs');
const readline = require('readline-sync');
// const text = fs.readFileSync('./test1.txt', 'utf8');
const text = fs.readFileSync('./test_hk.txt', 'utf8');

// Gets an access token.
function getAccessToken(subscriptionKey) {
    let options = {
        method: 'POST',
        uri: 'https://southeastasia.api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }
    return rp(options);
}

// Converts text to speech using the input from readline.
function textToSpeech(accessToken, text) {
    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        // .att('xmlns', 'http://www.w3.org/2001/10/synthesis')
        .att('xml:lang', 'zh-HK')
        .ele('voice')
        .att('name', 'Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)')
        // .up()
        // .ele('prosody')
        // .att('rate','+50.00%')
        // .att('volume','+20.00%')
        // .att('contour','(80%,+20%) (90%,+30%)')
        .txt(text)
        .end({ pretty: true});
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.replace(/&lt;/mg,'<').replace(/&gt;/mg,'>').toString();
    // console.log(body)
    let options = {
        method: 'POST',
        baseUrl: 'https://southeastasia.tts.speech.microsoft.com/',
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'YOUR_RESOURCE_NAME',
            'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }

    let request = rp(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                request.pipe(fs.createWriteStream('./hk.mp3'));
                console.log('\nYour file is ready.\n')
            }
        });
    return request;

};

// Use async and await to get the token before attempting
// to convert text to speech.
async function main() {
    // Reads subscription key from env variable.
    // You can replace this with a string containing your subscription key. If
    // you prefer not to read from an env variable.
    // e.g. const subscriptionKey = "your_key_here";
    const subscriptionKey = 'a37d365ba45c4f2a8541a547bf9c61db';
    if (!subscriptionKey) {
        throw new Error('Environment variable for your subscription key is not set.')
    };
    // Prompts the user to input text.
    // const text = readline.question('What would you like to convert to speech? ');
    try {
        const accessToken = await getAccessToken(subscriptionKey);
        await textToSpeech(accessToken, text);
    } catch (err) {
        console.log(`Something went wrong: ${err}`);
    }
}

// Run the application
main()