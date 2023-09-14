import { db } from '@/app'
import { buttonsConfig, buttonsUsers } from '@/commands/tickets/utils/ticketUpdateConfig'
import { type TextChannel, type CacheType, type ModalSubmitInteraction } from 'discord.js'

export default async function collectorModal (interaction: ModalSubmitInteraction<CacheType>, key: string, value: any): Promise<void> {
  const { customId, guildId, channel, channelId, message, fields } = interaction
  await interaction.deferReply({ ephemeral: true })

  if (customId === 'ticketSelectMenu') {
    const fieldNames = ['title', 'description', 'emoji']

    const existingData = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.select`)
    console.log('0', existingData)
    const data: any = existingData !== undefined ? existingData : []

    console.log('1', data)

    let title = ''
    let description = ''
    let emoji = ''

    for (const fieldName of fieldNames) {
      const message = fields.getTextInputValue(fieldName)

      if (fieldName === 'title') {
        title = message
      } else if (fieldName === 'description') {
        description = message
      } else if (fieldName === 'emoji') {
        emoji = message
      }
    }

    data.push({ title, description, emoji })

    console.log('2', data)

    await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.select`, data)

    await channel?.messages.fetch(String(message?.id))
      .then(async (msg) => {
        // const roleID = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.role`)
        const embed = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.embed`)
        if (typeof embed?.color === 'string') {
          if (embed?.color?.startsWith('#') === true) {
            embed.color = parseInt(embed?.color.slice(1), 16)
          }
        }
        await msg.edit({ embeds: [embed] })
          .then(async () => {
            await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.properties.${customId}`, true)
              .then(async () => {
                await buttonsConfig(interaction, msg)
              })
          })
      })
      .catch(async (err) => {
        console.log(err)
        await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
      })
    return
  }
  if (customId === 'ticketSendSave') {
    const { type } = value
    const messageModal = fields.getTextInputValue('content')

    const channelEmbedID = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.embedChannelID`)
    const channelVerify = interaction.guild?.channels.cache.get(channelEmbedID) as TextChannel
    const messageID = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.embedMessageID`)

    if (channelEmbedID !== undefined) {
      await channelVerify?.messages.fetch(messageID)
        .catch(async (err) => {
          console.log(err)
        })
      console.log('type:', type)
      console.log('messageModal:', messageModal)

      await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.${type}`, messageModal)

      const embed = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.embed`)
      const channel = interaction.guild?.channels.cache.get(messageModal) as TextChannel
      await channel.send({ embeds: [embed] })
        .then(async (msg) => {
          await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.embedMessageID`, msg.id)
          await buttonsUsers(interaction, message?.id, msg)
        })
        .catch(async (err) => {
          console.log(err)
        })
      return
    }
  }
  if (customId === key) {
    const { type } = value
    let messageModal = fields.getTextInputValue('content')
    console.log('type:', type)
    console.log('messageModal:', messageModal)

    if (messageModal.toLowerCase() === 'vazio') {
      messageModal = ''
    }

    await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.${type}`, messageModal)
    await channel?.messages.fetch(String(message?.id))
      .then(async (msg) => {
      // const roleID = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.role`)
        const embed = await db.guilds.get(`${guildId}.ticket.${channelId}.messages.${message?.id}.embed`)
        if (typeof embed?.color === 'string') {
          if (embed?.color?.startsWith('#') === true) {
            embed.color = parseInt(embed?.color.slice(1), 16)
          }
        }
        await msg.edit({ embeds: [embed] })
          .then(async () => {
            await db.guilds.set(`${guildId}.ticket.${channelId}.messages.${message?.id}.properties.${customId}`, true)
              .then(async () => {
                await buttonsConfig(interaction, msg)
                await interaction.editReply({ content: `${type} alterado para ${messageModal}` })
              })
          })
      })
      .catch(async (err) => {
        console.log(err)
        await interaction.editReply({ content: '❌ | Ocorreu um erro!' })
      })
  }
}
