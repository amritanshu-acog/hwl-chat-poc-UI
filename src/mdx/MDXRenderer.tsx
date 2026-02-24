import type { MDXComponent, TextData, AlertData, StepsData, ChoicesData, ImageBlockData, ChecklistData, EscalationData, SummaryData } from '../types'
import { Text } from './Text'
import { Alert } from './Alert'
import { Steps } from './Steps'
import { Choices } from './Choices'
import { ImageBlock } from './ImageBlock'
import { Checklist } from './Checklist'
import { Escalation } from './Escalation'
import { Summary } from './Summary'

interface ContextChunk {
    chunk_id: string
    topic: string
    summary: string
    file: string
}

interface Props {
    content: string
    primaryColor: string
    onChoiceSelect?: (value: string) => void
    onCreateTicket?: () => void
}

/**
 * Extracts the PDF filename from a chunk file string.
 * e.g. "hwl-agency-assignment-agreement-v4-add-agreement-note-6ba3f547.md"
 * → "HWL Agency_Assignment Agreement V4.pdf"
 */
function extractPdfName(file: string): string {
    const match = file.match(/^(.+?)-v(\d+)-.+\.md$/)
    if (match) {
        const base = match[1] // e.g. "hwl-agency-assignment-agreement"
        const version = match[2] // e.g. "4"
        const parts = base.split('-')
        const prefix = parts[0].toUpperCase() // "HWL"
        const rest = parts
            .slice(1)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') // "Agency Assignment Agreement"
        return `${prefix} ${rest} V${version}.pdf`
    }
    return file.replace(/\.md$/, '.pdf')
}

/**
 * Groups context chunks by their source PDF, deduplicating the PDF name
 * but listing all unique topics under each.
 */
function groupChunksBySource(chunks: ContextChunk[]): Map<string, string[]> {
    const map = new Map<string, string[]>()
    for (const chunk of chunks) {
        const pdf = extractPdfName(chunk.file)
        if (!map.has(pdf)) map.set(pdf, [])
        const topics = map.get(pdf)!
        if (!topics.includes(chunk.topic)) topics.push(chunk.topic)
    }
    return map
}

/**
 * Parses message content and renders appropriate MDX components.
 * Handles both JSON array format and fallback to plain text/markdown.
 */
export function MDXRenderer({ content, primaryColor, onChoiceSelect, onCreateTicket }: Props) {
    let components: MDXComponent[] | null = null
    let contextChunks: ContextChunk[] = []

    console.log('🔍 MDXRenderer received content:', content)
    console.log('🔍 Content type:', typeof content)

    try {
        const parsed = JSON.parse(content)
        console.log('✅ Parsed JSON:', parsed)

        if (Array.isArray(parsed)) {
            components = parsed
        } else if (parsed && typeof parsed === 'object' && 'response' in parsed) {
            const resp = parsed.response
            if (Array.isArray(resp)) {
                components = resp
                console.log('✅ Wrapped array component in response:', components)
            } else if (resp && typeof resp === 'object' && 'type' in resp && 'data' in resp) {
                components = [resp]
                console.log('✅ Wrapped single component in response:', components)
            } else if (typeof resp === 'string') {
                components = [{ type: 'text', data: { body: resp } }]
            }

            if (Array.isArray(parsed.contextChunks)) {
                contextChunks = parsed.contextChunks
            }
        } else if (parsed && typeof parsed === 'object' && 'type' in parsed && 'data' in parsed) {
            components = [parsed]
            console.log('✅ Wrapped single component:', components)
        }
    } catch (error) {
        console.log('❌ JSON parse failed:', error)
    }

    if (!components || components.length === 0) {
        return null
    }

    const groupedSources = groupChunksBySource(contextChunks)

    return (
        <div className="space-y-2">
            {components.map((component, idx) => {
                switch (component.type) {
                    case 'text':
                        return <Text key={`comp-${idx}`} data={component.data as TextData} />

                    case 'alert':
                        return <Alert key={`comp-${idx}`} data={component.data as AlertData} />

                    case 'steps':
                        return <Steps key={`comp-${idx}`} data={component.data as StepsData} primaryColor={primaryColor} />

                    case 'choices':
                        return (
                            <Choices
                                key={`comp-${idx}`}
                                data={component.data as ChoicesData}
                                onSelect={onChoiceSelect}
                                primaryColor={primaryColor}
                            />
                        )

                    case 'image':
                        return <ImageBlock key={`comp-${idx}`} data={component.data as ImageBlockData} />

                    case 'checklist':
                        return <Checklist key={`comp-${idx}`} data={component.data as ChecklistData} primaryColor={primaryColor} />

                    case 'escalation':
                        return (
                            <Escalation
                                key={`comp-${idx}`}
                                data={component.data as EscalationData}
                                primaryColor={primaryColor}
                                onCreateTicket={onCreateTicket}
                            />
                        )

                    case 'summary':
                        return <Summary key={`comp-${idx}`} data={component.data as SummaryData} primaryColor={primaryColor} />

                    default:
                        console.warn(`Unknown MDX component type: ${(component as any).type}`)
                        return null
                }
            })}

            {groupedSources.size > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-500 mb-2 block">Sources</span>
                    <div className="flex flex-col gap-3">
                        {Array.from(groupedSources.entries()).map(([pdfName, topics], i) => (
                            <div key={`source-group-${i}`}>
                                {/* PDF filename */}
                                <div className="flex items-center gap-1.5 mb-1">
                                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm0 1.5L18.5 9H14V3.5zM6 20V4h6v7h7v9H6z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-gray-700">{pdfName}</span>
                                </div>
                                {/* Topics under this PDF */}
                                <div className="flex flex-col gap-0.5 pl-5">
                                    {topics.map((topic, j) => (
                                        <span key={`topic-${i}-${j}`} className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}