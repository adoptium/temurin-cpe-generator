# Temurin Common Platform Enumeration Specification

The Common Platform Enumeration (CPE) is a structured naming scheme for information technology systems, software, and packages maintained by the US National Institute of Standards and Technology (NIST). Based upon the generic syntax for Uniform Resource Identifiers (URIs), a CPE includes a formal name format, a method for checking names against a system, and a description format for binding text and tests to a name. CPE definitions are provided to NIST in an XML file. Specifics for the XML file and CPE names can be found in the CPE 2.3 specifications [NIST IR 7695 - Common Platform Enumeration: Naming Specification Version 2.3](http://csrc.nist.gov/publications/nistir/ir7695/NISTIR-7695-CPE-Naming.pdf). 

## Temurin CPE Design

The Temurin product CPE is defined using the following fields. Given the change in version numbering in OpenJDK since JDK8 there are two slightly different approaches for JDK8 and JDK9 onwards.

Most of the fields are statically defined and depict the type ('a' for runtime), vendor, and product. The version is a semver derived from the Temurin release name. Other fields are left undefined ('*' for undefined) to keep it simple.

Example
`cpe:2.3:a:eclipse:temurin:17.0.8:*:*:*:*:*:*:*`

| Field | Value |
| ----- | ----- |
| URL | cpe:2.3 |
| Part | a |
| Vendor | eclipse |
| Product | temurin |
| Version | 17.0.8 |
| Update | * |
| Edition | * |
| Langauge | * |
| SW Edition | * |
| Target SW | * |
| Target HW | * |
| Other | * |

Example
`cpe:2.3:a:eclipse:temurin:1.8.0:u382:*:*:*:*:*:*`

| Field | Value |
| ----- | ----- |
| URL | cpe:2.3 |
| Part | a |
| Vendor | eclipse |
| Product | temurin |
| Version | 1.8.0 |
| Update | u382 |
| Edition | * |
| Langauge | * |
| SW Edition | * |
| Target SW | * |
| Target HW | * |
| Other | * |

## CPE dictionary submission

The CPE generator in this repository produces XML in the required format for submission to the [Official NIST CPE dictionary](https://nvd.nist.gov/products/cpe). This dictionary is used globally to refer to our release packages.

The dictionary format definitions are defined in the document [NIST IR 7697 - Common Platform Enumeration: Dictionary Specification Version 2.3](http://csrc.nist.gov/publications/nistir/ir7697/NISTIR-7697-CPE-Dictionary.pdf). Please note that the valid values for the reference element are ADVISORY, CHANGE_LOG, PRODUCT, PROJECT, VENDOR, and VERSION (all in capitals). Here's an example entry for Temurin in the required format.

```xml
  <cpe-item name="cpe:/a:eclipse:temurin:17.0.8">
    <title xml:lang="en-US">Eclipse Temurin 17.0.8+7</title>
    <references>
      <reference href="https://github.com/adoptium/temurin17-binaries/releases/tag/jdk-17.0.8%2B7">VERSION</reference>
      <reference href="https://www.adoptium.net/temurin">WEBSITE</reference>
      <reference href="https://www.eclipse.org/">VENDOR</reference>
    </references>
    <cpe-23:cpe23-item name="cpe:2.3:a:eclipse:temurin:17.0.8:*:*:*:*:*:*:*"/>
  </cpe-item>
```


## Dictionary search

The official dictionary can be searched to show the current Temurin product listings, as shown below

```sh
curl -X GET 'https://services.nvd.nist.gov/rest/json/cpes/1.0?cpeMatchString=cpe:2.3:a:eclipse:temurin' -H 'accept: application/json' | jq
```

## Updates

Updates to the dictionary such as additions, modifications, or obsoletion, should be addressed to NIST via e-mail at `cpe_dictionary at nist dot gov`. only include items that you wish to update with your submissions, if no changes are needed to the Title or Provenance data, existing CPE Names should not be included in the file.
