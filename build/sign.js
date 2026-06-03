// Sign Windows binaries with Azure Artifact Signing (formerly Trusted Signing)
// via AzureSignTool. No-op when AZURE_CERT_PROFILE_NAME is unset so local /
// CI builds without secrets keep producing unsigned artifacts.
const { execFileSync } = require('node:child_process')

exports.default = async function sign(configuration) {
  const profile = process.env.AZURE_CERT_PROFILE_NAME
  if (!profile) return

  const required = [
    'AZURE_TENANT_ID',
    'AZURE_CLIENT_ID',
    'AZURE_CLIENT_SECRET',
    'AZURE_ENDPOINT',
    'AZURE_CODE_SIGNING_NAME',
  ]
  for (const k of required) {
    if (!process.env[k]) throw new Error(`Missing env ${k} for Azure signing`)
  }

  execFileSync(
    'azuresigntool',
    [
      'sign',
      '-kvu', process.env.AZURE_ENDPOINT,
      '-kvt', process.env.AZURE_TENANT_ID,
      '-kvi', process.env.AZURE_CLIENT_ID,
      '-kvs', process.env.AZURE_CLIENT_SECRET,
      '-kvc', `${process.env.AZURE_CODE_SIGNING_NAME}/${profile}`,
      '-tr', 'http://timestamp.acs.microsoft.com',
      '-td', 'sha256',
      '-fd', 'sha256',
      configuration.path,
    ],
    { stdio: 'inherit' },
  )
}
