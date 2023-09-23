import { db } from '@/app'
import { EmbedBuilder, type ButtonInteraction, type CacheType, ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, type ModalSubmitInteraction, codeBlock } from 'discord.js'

export interface Data {
  amount?: number
  creditos?: number
  quantity?: number
  typeEmbed?: number
  typeRedeem?: number
  cupom?: {
    name?: string
    porcent?: number
    cupomAmount?: number
  }
  fields?: Array<{ value: string }>
}

interface User {
  name: string
  email: string
  credits: number
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class paymentEmbed {
  public static async TypeRedeem (options: {
    interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
    data: Data
    user?: User
    message?: Message<boolean>
  }): Promise<{ rEmbeds: EmbedBuilder[], rComponents: Array<ActionRowBuilder<ButtonBuilder>> }> {
    const { interaction, data, user, message } = options
    const { typeEmbed, typeRedeem, cupom, creditos, amount, quantity } = data

    console.log(typeEmbed, cupom, typeRedeem, creditos, amount, quantity)

    let titulo
    let descrição
    let type

    if (typeEmbed === 0 || typeEmbed === undefined) {
      titulo = 'Checkout e Quantidade'
      descrição = 'Selecione quantos produtos deseja no seu carrinho, e se quer aplicar algum cupom.'
    } else if (typeEmbed === 1 || typeEmbed === undefined) {
      titulo = 'Checkout e Envio'
      descrição = `<@${interaction?.user.id}> Confira as informações sobre os produtos e escolha a forma que deseja receber seus créditos:`
    } else if (typeEmbed === 2) {
      titulo = 'Checkout e Pagamento'
      descrição = 'Confira as informações sobre os produtos e gere o link para o pagamento:'
    }
    if (typeRedeem === 1) {
      type = 'DM'
    } else if (typeRedeem === 2) {
      type = 'Direct'
    } else {
      type = 'Não selecionado.'
    }

    const mainEmbed = new EmbedBuilder()
      .setColor('LightGrey')
      .setTitle(titulo ?? 'Indefinido')
      .setDescription(descrição ?? 'Indefinido')

    const infoPayment = new EmbedBuilder()
      .setColor('LightGrey')
      .setTitle('Informações do Pagamento')
      .addFields(
        {
          name: '**💰 Valor (Individual):**',
          value: `R$${cupom?.cupomAmount ?? amount ?? '0'}`
        },
        {
          name: '**📦 Quantidade:**',
          value: `${quantity ?? 1}`
        },
        {
          name: '**🛒 Valor Total (sem taxas):**',
          value: `R$${(cupom?.cupomAmount ?? amount ?? 0) * (quantity ?? 1)}`
        },
        {
          name: '**✉️ Método de envio:**',
          value: type
        }
      )

    if ((typeEmbed === 0) || (cupom?.name !== undefined)) {
      infoPayment.addFields(
        {
          name: '**🎫 Cupom:**',
          value: cupom?.name !== undefined ? '(' + (cupom?.porcent ?? 0) + '%)' : 'Indefinido'
        }
      )
    }

    if (creditos !== undefined) {
      infoPayment.addFields(
        {
          name: '**🪙 Créditos totais:**',
          value: `${creditos ?? 'Indefinido'}`
        }
      )
    }

    const embeds = [mainEmbed, infoPayment]

    if (user !== undefined) {
      const userEmbed = new EmbedBuilder()
        .setColor('LightGrey')
        .setTitle('Informações do Usuário')
        .addFields(
          {
            name: '**📧 E-mail:**',
            value: user?.email ?? 'Indefinido',
            inline: false
          },
          {
            name: '**🤝 Usuário:**',
            value: user?.name ?? 'Indefinido',
            inline: false
          },
          {
            name: '**💳 Créditos atuais:**',
            value: user?.credits?.toFixed(2) ?? 'Indefinido',
            inline: false
          }
        )

      embeds.push(userEmbed)
    }

    if (typeEmbed === 2) {
      const infoTax = new EmbedBuilder()
        .setColor('LightGrey')
        .setTitle('Taxas dos Métodos de pagamento:')
        .addFields(
          { name: '**💠 PIX:**', value: '1%', inline: false },
          { name: '**💳 Cartão de Débito:**', value: '1.99%', inline: false },
          { name: '**💳 Cartão de Crédito:**', value: '4.98%', inline: false }
        )
      embeds.push(infoTax)
    }

    const components = await paymentEmbed.ButtonEmbed({
      interaction,
      type: typeEmbed
    })

    if (message !== undefined) {
      const embedsEdit = embeds.map((embedBuilder) =>
        embedBuilder.toJSON()
      )
      const componentsEdit = components.map((componentsBuilder) =>
        componentsBuilder.toJSON()
      )
      const clearData = { components: [] }
      await message.edit({ ...clearData })

      await message.edit({ embeds: embedsEdit, components: componentsEdit })
    }
    return { rEmbeds: embeds, rComponents: components }
  }

  public static async ButtonEmbed (options: {
    interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
    type?: number
  }): Promise<Array<ActionRowBuilder<ButtonBuilder>>> {
    const { type, interaction } = options
    const { guildId, user } = interaction

    const Primary = [
      new ButtonBuilder({
        customId: 'paymentUserRem',
        emoji: '➖',
        style: ButtonStyle.Secondary
      }),
      new ButtonBuilder({
        customId: 'paymentUserAdd',
        emoji: '➕',
        style: ButtonStyle.Primary
      }),
      new ButtonBuilder({
        customId: 'paymentUserCupom',
        emoji: '🎫',
        style: ButtonStyle.Primary
      })
    ]

    const Secondary = [
      new ButtonBuilder({
        customId: 'paymentUserDM',
        label: 'Mensagem via DM',
        emoji: '💬',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: 'paymentUserDirect',
        label: 'Instantaneamente',
        emoji: '📲',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        url: 'https://dash.seventyhost.net/',
        emoji: '🔗',
        style: ButtonStyle.Link
      })
    ]

    const Third = [
      new ButtonBuilder({
        customId: 'paymentUserGerarPix',
        label: 'PIX',
        emoji: '💠',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: 'paymentUserGerarCardDebito',
        label: 'Cartão de Débito',
        emoji: '💳',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: 'paymentUserGerarCardCredito',
        label: 'Cartão de Crédito',
        emoji: '💳',
        style: ButtonStyle.Success
      })
    ]

    const footerBar = [
      new ButtonBuilder({
        customId: 'paymentUserBefore',
        label: 'Voltar',
        emoji: '⬅️',
        style: ButtonStyle.Secondary
      }),
      new ButtonBuilder({
        customId: 'paymentUserNext',
        label: 'Proximo',
        emoji: '➡️',
        style: ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: 'paymentUserWTF',
        label: 'Saiba Mais',
        emoji: '❔',
        style: ButtonStyle.Primary
      }),
      new ButtonBuilder({
        customId: 'paymentUserCancelar',
        label: 'Cancelar',
        emoji: '✖️',
        style: ButtonStyle.Danger
      })
    ]

    const row1 = new ActionRowBuilder<ButtonBuilder>()
    const row2 = new ActionRowBuilder<ButtonBuilder>()

    if (type === 0 || type === undefined) {
      row1.setComponents(...Primary)
      row2.setComponents(...footerBar)
    } else if (type === 1) {
      row1.setComponents(...Secondary)
      row2.setComponents(...footerBar)
    } else if (type === 2) {
      row1.setComponents(...Third)
      row2.setComponents(...footerBar)
    }

    for (const value of footerBar) {
      const { custom_id: customID } = Object(value.toJSON())
      const data = await db.payments.get(`${guildId}.process.${user.id}`) as Data

      if (customID === 'paymentUserBefore' && data?.typeEmbed !== undefined && data.typeEmbed === 0) {
        value.setDisabled(true)
      }
    }

    for (const value of Primary) {
      const { custom_id: customID } = Object(value.toJSON())
      const data = await db.payments.get(`${guildId}.process.${user.id}`)

      if (customID === 'paymentUserRem' && data?.quantity <= 1) {
        console.log('Botão paymentUserRem, foi desabilidado.')
        value.setDisabled(true)
      } else {
        value.setStyle(ButtonStyle.Primary)
      }

      if (customID === 'paymentUserCupom' && data?.properties?.cupom === true) {
        value.setDisabled(true)
      }
    }

    for (const value of Secondary) {
      const { custom_id: customID } = Object(value.toJSON())
      const data = await db.payments.get(`${guildId}.process.${user.id}`)
      console.log(customID, data?.typeRedeem, data?.properties?.[customID])
      if (customID === 'paymentUserDM' && data?.typeRedeem === 1 && data?.properties?.[customID] === true) {
        value.setDisabled(true)
      }
      if (customID === 'paymentUserDirect' && data?.typeRedeem === 2 && data?.properties[customID] === true) {
        value.setDisabled(true)
      }
    }

    return [row1, row2]
  }

  public static async displayData (options: {
    interaction: ButtonInteraction<CacheType> | ModalSubmitInteraction<CacheType>
    data: Data
    type?: 'editReply' | 'reply'
  }): Promise<void> {
    const { interaction, type, data } = options
    const embed = new EmbedBuilder({
      title: '⚙️ | Setado com sucesso!',
      description: 'Seus dados estão aqui, de forma limpa e justa.\nApos o pagamento/exclusão eles serão deletados.',
      fields: [
        {
          name: '📑 Dados:',
          value: codeBlock('json', JSON.stringify(data, null, 4))
        }
      ]
    }).setColor('Green')

    if (type === 'reply' || type === undefined) {
      await interaction.reply({
        ephemeral,
        embeds: [embed]
      })
    } else {
      await interaction.editReply({
        embeds: [embed]
      })
    }
  }
}
