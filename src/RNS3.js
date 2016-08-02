/**
 * RNS3
 */

import { Request } from './Request';
import { S3Policy } from './S3Policy';

const EXPECTED_RESPONSE_KEY_VALUE_RE = {
  key: /<Key>(.*)<\/Key>/,
  etag: /<ETag>"?([^"]*)"?<\/ETag>/,
  bucket: /<Bucket>(.*)<\/Bucket>/,
  location: /<Location>(.*)<\/Location>/,
}

const extractResponseValues = (responseText) => {
  return null == responseText ? null : Object.keys(EXPECTED_RESPONSE_KEY_VALUE_RE)
    .reduce((result, key) => {
      let match = responseText.match(EXPECTED_RESPONSE_KEY_VALUE_RE[key]);
      return Object.assign(result, { [key]: match && match[1] });
    }, {});
}

const setBodyAsParsedXML = (response) => {
  return Object.assign(response, { body: { postResponse: extractResponseValues(response.text) } });
}

export class RNS3 {

  static put(file, options) {
    options = Object.assign({}, options, {
      key: (options.keyPrefix || '') + file.name,
      contentType: file.type
    });

    // for china region
    let url = `https://${ options.bucket }.s3.cn-north-1.amazonaws.com.cn`;
    // let url = `https://${ options.bucket }.s3.amazonaws.com`;
    let method = "POST";
    let policy = S3Policy.generate(options);

    return Request.create(url, method, policy)
      .set("file", file)
      .send()
      .then(setBodyAsParsedXML);
  }

}
