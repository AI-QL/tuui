// Define the structure of a registry package
export type McpRegistryPackage = {
  identifier: string
  registryType: 'mcpb' | 'npm' | 'oci' | 'pypi' | string
  registryBaseUrl?: string
  transport?: {
    type: string
  }
}

// Define the structure of a registry server
export type McpRegistryServer = {
  server: {
    name: string
    description: string
    version: string
    repository: {
      source: string
      url: string
    }
    packages: McpRegistryPackage[]
    remotes: {
      url: string
      type: string
    }[]
  }
}

// Define the structure of a registry type
export type McpRegistryType = {
  servers: McpRegistryServer[]
  metadata: {
    nextCursor: string
    count: number
  }
}
