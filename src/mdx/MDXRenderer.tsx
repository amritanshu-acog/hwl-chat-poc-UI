import type { MDXComponent, TextData, AlertData, StepsData, ChoicesData, ImageBlockData, ChecklistData, EscalationData, SummaryData } from '../types'
import { Text } from './Text'
import { Alert } from './Alert'
import { Steps } from './Steps'
import { Choices } from './Choices'
import { ImageBlock } from './ImageBlock'
import { Checklist } from './Checklist'
import { Escalation } from './Escalation'
import { Summary } from './Summary'

interface Props {
    content: string
    primaryColor: string
    onChoiceSelect?: (value: string) => void
    onCreateTicket?: () => void
}

/**
 * Parses message content and renders appropriate MDX components.
 * Handles both JSON array format and fallback to plain text/markdown.
 */
export function MDXRenderer({ content, primaryColor, onChoiceSelect, onCreateTicket }: Props) {
    // Try to parse as JSON
    let components: MDXComponent[] | null = null

    console.log('🔍 MDXRenderer received content:', content)
    console.log('🔍 Content type:', typeof content)

    try {
        const parsed = JSON.parse(content)
        console.log('✅ Parsed JSON:', parsed)

        // Handle array of components
        if (Array.isArray(parsed)) {
            components = parsed
        }
        // Handle single component object
        else if (parsed && typeof parsed === 'object' && 'type' in parsed && 'data' in parsed) {
            components = [parsed]
            console.log('✅ Wrapped single component:', components)
        }
    } catch (error) {
        console.log('❌ JSON parse failed:', error)
        // Not JSON, will fall back to plain text rendering
    }

    // If no valid JSON, return null (let MessageBubble handle markdown/text)
    if (!components || components.length === 0) {
        return null
    }

    // Render each component based on type
    return (
        <div className="space-y-2">
            {components.map((component, idx) => {
                switch (component.type) {
                    case 'text':
                        return <Text key={idx} data={component.data as TextData} />

                    case 'alert':
                        return <Alert key={idx} data={component.data as AlertData} />

                    case 'steps':
                        return <Steps key={idx} data={component.data as StepsData} primaryColor={primaryColor} />

                    case 'choices':
                        return (
                            <Choices
                                key={idx}
                                data={component.data as ChoicesData}
                                onSelect={onChoiceSelect}
                                primaryColor={primaryColor}
                            />
                        )

                    case 'image':
                        return <ImageBlock key={idx} data={component.data as ImageBlockData} />

                    case 'checklist':
                        return <Checklist key={idx} data={component.data as ChecklistData} primaryColor={primaryColor} />

                    case 'escalation':
                        return (
                            <Escalation
                                key={idx}
                                data={component.data as EscalationData}
                                primaryColor={primaryColor}
                                onCreateTicket={onCreateTicket}
                            />
                        )

                    case 'summary':
                        return <Summary key={idx} data={component.data as SummaryData} primaryColor={primaryColor} />

                    default:
                        console.warn(`Unknown MDX component type: ${(component as any).type}`)
                        return null
                }
            })}
        </div>
    )
}