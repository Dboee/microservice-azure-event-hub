#Azure Event Hub Microservice

Ref: https://learn.microsoft.com/nb-no/azure/event-hubs/event-hubs-node-get-started-send?tabs=passwordless%2Croles-azure-portal

##Description:
This microservice is used to read from an Azure Event Hub and write the messages to Azure Blob Storage.

#Pre-Requisites:

- Node.js LTS.
- Visual Studio Code (recommended) or any other integrated development environment (IDE).

- Azure-CLI
- Microsoft Azure subscription.
- Azure Event Hubs namespace
- Azure Event Hub
- Grant `Azure Event Hubs Data Owner` access to your user account.
- Azure storage account
- Azure Blob container in the storage account
- Grant `Storage Blob Data Contributor` access to your user account.

### Assign roles to your Azure AD user

When developing locally, make sure that the user account that connects to Azure Event Hubs has the correct permissions. You'll need the Azure Event Hubs Data Owner role in order to send and receive messages. To assign yourself this role, you'll need the User Access Administrator role, or another role that includes the Microsoft.Authorization/roleAssignments/write action. You can assign Azure RBAC roles to a user using the Azure portal, Azure CLI, or Azure PowerShell.

##Required Parameters:

- EVENT_HUBS_RESOURCE_NAME: The name of the Azure Event Hub Resource
- EVENT_HUB_NAME: The name of the Azure Event Hub
- STORAGE_ACCOUNT_NAME: The name of the Azure Storage Account
- STORAGE_CONTAINER_NAME: The name of the Azure Storage Container
