import { describe, expect, test } from "@jest/globals";
import { normalizeHtml, hashNormalizedHtml, __test } from "../../Services/webMonitorUtils";

const BASE_HTML: string = `<!DOCTYPE html>
<html lang="de">
  <head><title>Job</title></head>
  <body>
    <div class="job-detail">
      <h1>Universität Leipzig – Beispielstelle</h1>
      <a class="apply" href="https://uni-leipzig.b-ite.careers/jobposting/4ddc9c28a154ea73d0e589834c5bbd61439705dc0">Jetzt bewerben</a>
      <p>Ihre Aufgaben umfassen Forschung, Lehre und Verwaltung.</p>
    </div>
  </body>
</html>`;

const VARIANT_HTML_WITH_DYNAMIC_ARTIFACTS: string = `<!DOCTYPE html>
<html lang="de">
  <head>
    <title>Job</title>
    <script>var tracker = "should be stripped";</script>
  </head>
  <body tabindex="0">
    <div class="job-detail" tabindex="-1">
      <h1 id="j_idt109">Universität Leipzig – Beispielstelle</h1>
      <a class="apply" href="https://uni-leipzig.b-ite.careers/jobposting/4ddc9c28a154ea73d0e589834c5bbd61439705dc0?sid=ABCD1234">Jetzt bewerben</a>
      <p>Ihre Aufgaben umfassen Forschung, Lehre und Verwaltung.</p>
    </div>
  </body>
</html>`;

const VARIANT_HTML_WITH_WHITESPACE: string = `<!DOCTYPE html>
<html lang="de">
  <head>
    <title>Job</title>
  </head>
  <body>
    <div class="job-detail">
      <h1>Universität Leipzig – Beispielstelle</h1>
  <a class="apply" href="https://uni-leipzig.b-ite.careers/jobposting/4ddc9c28a154ea73d0e589834c5bbd61439705dc0">Jetzt&nbsp;bewerben</a>
      <p>Ihre  Aufgaben\n        umfassen Forschung,\u00a0Lehre   und Verwaltung.</p>
    </div>
  </body>
</html>`;

describe("webMonitorUtils hashing", function () {
  test("normalizeHtml removes sid query params and dynamic attributes", function () {
    const NORMALIZED_BASE: string = normalizeHtml(BASE_HTML);
    const NORMALIZED_VARIANT: string = normalizeHtml(VARIANT_HTML_WITH_DYNAMIC_ARTIFACTS);

    expect(NORMALIZED_VARIANT).toBe(NORMALIZED_BASE);
  });

  test("hashNormalizedHtml yields identical hash for equivalent content", function () {
    const HASH_BASE: string = hashNormalizedHtml(BASE_HTML);
    const HASH_VARIANT: string = hashNormalizedHtml(VARIANT_HTML_WITH_DYNAMIC_ARTIFACTS);

    expect(HASH_VARIANT).toBe(HASH_BASE);
  });

  test("normalizeHtml collapses whitespace and nbsp entities", function () {
    const NORMALIZED_BASE: string = normalizeHtml(BASE_HTML);
    const NORMALIZED_VARIANT: string = normalizeHtml(VARIANT_HTML_WITH_WHITESPACE);

    expect(NORMALIZED_VARIANT).toBe(NORMALIZED_BASE);
  });

  test("hashNormalizedHtml ignores whitespace-only differences", function () {
    const HASH_BASE: string = hashNormalizedHtml(BASE_HTML);
    const HASH_VARIANT: string = hashNormalizedHtml(VARIANT_HTML_WITH_WHITESPACE);

    expect(HASH_VARIANT).toBe(HASH_BASE);
  });
});

describe("Leipzig-specific hashing helpers", function () {
  test("stripDynamicQueryParams removes tx_news and cHash parameters", function () {
    const RAW_URL: string =
      "/universitaet/arbeiten?tx_news_pi1%5BpluginId%5D=906026&cHash=abc123&foo=bar#anchor";
    const CLEANED: string = __test.stripDynamicQueryParams(RAW_URL);

    expect(CLEANED).toBe("/universitaet/arbeiten?foo=bar#anchor");
  });

  test("stripDynamicQueryParams drops all params when only dynamic ones are present", function () {
    const RAW_URL: string =
      "/universitaet/arbeiten?tx_news_pi1%5BpluginId%5D=906026&cHash=abc123";
    const CLEANED: string = __test.stripDynamicQueryParams(RAW_URL);

    expect(CLEANED).toBe("/universitaet/arbeiten");
  });

  test("needsLeipzigStabilityCheck recognizes relevant URL patterns", function () {
    expect(
      __test.needsLeipzigStabilityCheck(
        "https://www.uni-leipzig.de/universitaet/stellenausschreibung/artikel/example",
      ),
    ).toBe(true);

    expect(
      __test.needsLeipzigStabilityCheck(
        "https://uni-leipzig.b-ite.careers/jobposting/abc",
      ),
    ).toBe(true);

    expect(
      __test.needsLeipzigStabilityCheck("https://example.com/universitaet/stellenausschreibung"),
    ).toBe(false);
  });

  test("buildRequestConfig adds polite headers for Leipzig domains", function () {
    const CONFIG_WITH_HEADERS = __test.buildRequestConfig(
      "https://www.uni-leipzig.de/universitaet/stellenausschreibung/artikel/example",
    );
    expect(CONFIG_WITH_HEADERS.headers?.["User-Agent"]).toContain("Mozilla/5.0");

    const GENERIC_CONFIG = __test.buildRequestConfig("https://example.com/job");
    expect(GENERIC_CONFIG.headers).toBeUndefined();
  });

  test("sanitizeLeipzigDynamicHtml removes hidden inputs and dynamic params", function () {
    const RAW_HTML: string =
      '<form action="/universitaet/arbeiten?tx_news_pi1%5BpluginId%5D=906026&cHash=abc"><input type="hidden" name="tx_news_pi1[__referrer]" value="abcdef" /><a href="/foo?cHash=1&foo=bar">Link</a></form>';

    const SANITIZED: string = __test.sanitizeLeipzigDynamicHtml(RAW_HTML);

    expect(SANITIZED).not.toContain("tx_news_pi1");
    expect(SANITIZED).not.toContain("cHash=abc");
    expect(SANITIZED).toContain('href="/foo?foo=bar"');
  });
});
