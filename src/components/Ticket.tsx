import { CompanyEntity, TicketTypeEntity } from '@/services/store';
import { Page, Text, Image, View, Document, StyleSheet, Font } from '@react-pdf/renderer';


const changaFontSource = browser.runtime.getURL('/fonts/Changa-Regular.ttf');
const bayzatImageSource = browser.runtime.getURL('/images/bayzat.png');

Font.register({ family: 'Changa', src: changaFontSource });

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Changa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottom: 2,
        borderBottomColor: '#9647ff',
        paddingBottom: 8,
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statusBadge: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        padding: '4 8',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    pendingStatusBadge: {
        backgroundColor: '#fafcdc',
        color: '#646516',
        padding: '4 8',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 8,
    },
    grid: {
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        marginBottom: 8,
    },
    infoBox: {
        flex: 1,
        padding: '12px',
        border: '1px',
        borderColor: '#e2e8f0',
        borderRadius: '6px',
    },
    label: {
        fontSize: 9,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    lableValue: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    contentText: {
        fontSize: 11,
        lineHeight: 1.5,
    },
    contentBlock: {
        backgroundColor: '#f8fafc',
        padding: '8px',
        borderRadius: '6px',
        marginBottom: 10,
    },
    borderedContent: {
        fontSize: 16,
        color: '#9647ff',
        fontWeight: 'bold',
    },
    approverList: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 5,
    },
    approverTag: {
        border: '1px',
        borderColor: '#cbd5e1',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: 11,
    }
});


type PropsType = {
    ticket: TicketResponse,
    company: CompanyEntity,
    ticketType: TicketTypeEntity,
}

const HeaderView = ({ company }: PropsType) => {
    return (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px', borderBottomColor: '#303234' }}>
            {company.logo ?
                (<Image src={company.logo} style={{ height: 80, margin: '8px 0' }} />) :
                (<Text style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase' }}>{company.name}</Text>)
            }
        </View>)
}

const FooterView = () => (
    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '1px', borderTopColor: '#303234' }}>
        <Image src={bayzatImageSource} style={{ height: 20, margin: '8px 0' }} />
    </View>
)

const TitleView = ({ ticket }: { ticket: PropsType['ticket'] }) => {
    const isPending = ticket.approval_status.trim().toLowerCase() === 'pending'
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>[ {ticket.identifier} ] - Request Summary</Text>
                <Text style={{ color: '#64748b', marginTop: 2, fontSize: '9px' }}>Created: {new Date(ticket.created_at * 1000).toDateString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={(!isPending ? styles.statusBadge : styles.pendingStatusBadge)}>{ticket.approval_status}</Text>
                <Text style={{ marginTop: 6, fontSize: 9 }}>Priority: {ticket.priority}</Text>
            </View>
        </View>
    )
}

const MainView = ({ ticket }: { ticket: PropsType['ticket'] }) => {
    const requestedBy = `${ticket.creator.first_name} ${ticket.creator.last_name}`;
    const lineManager = `${ticket.line_manager.first_name} ${ticket.line_manager.last_name}`;
    const employee = `${ticket.employee.first_name} ${ticket.employee.last_name}`;
    const category = `${ticket.category_name} • ${ticket.type}`;

    return (
        <View style={styles.grid}>
            <View style={styles.infoBox}>
                <Text style={styles.label}>Requested By</Text>
                <Text style={styles.lableValue}>{requestedBy}</Text>
                <View style={{ marginTop: 3 }}>
                    <Text style={styles.label}>Line Manager</Text>
                    <Text style={styles.lableValue}>{lineManager}</Text>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.label}>Employee</Text>
                <Text style={styles.lableValue}>{employee}</Text>
                <View style={{ marginTop: 3 }}>
                    <Text style={styles.label}>Category / Type</Text>
                    <Text style={styles.lableValue}>{category}</Text>
                </View>
            </View>
        </View>
    )
}

const ApproversView = ({ ticket }: { ticket: PropsType['ticket'] }) => {
    const approvers = [...new Set(ticket.approvers
        .filter(p => p.status === 'accepted' && 'employee_full_name' in p)
        .map(p => 'employee_full_name' in p ? p['employee_full_name'] as string : null)
    )];

    return (
        <View style={{ marginTop: 20, }}>
            <Text style={styles.label}>Approvered By</Text>
            {
                (approvers.length === 0) ? (
                    <View style={styles.approverList}>
                        <Text style={styles.approverTag}>NONE</Text>
                    </View>
                ) : (
                    <View style={styles.approverList}>
                        {approvers.map((approver, index) => (
                            <Text key={index} style={styles.approverTag}>
                                {approver}
                            </Text>
                        ))}
                    </View>
                )
            }
        </View>
    )
}

const StyledView = ({ ticket, ticketType }: PropsType) => {

    const properties = ticketType.properties
        .filter(p => p.enabled && p.highlighted)
        .map(p => p.id);

    const styledProps = ticket.translated_data_with_keys
        .filter(dk => Object.values(properties).flat().includes(dk.key))
        .map(d => ({ title: d.translated_name, content: d.value }));

    if (styledProps.length === 0) return (<View></View>)

    return (
        <View style={{ display: 'flex', flexDirection: 'column', marginTop: 3, marginBottom: 3 }}>
            {styledProps.map((prop, idx) => (
                <View key={idx} style={[styles.contentBlock, { borderLeft: 3, borderLeftColor: '#9647ff' }]}>
                    <Text style={styles.label}>{prop.title}</Text>
                    <Text style={styles.contentText}>{prop.content}</Text>
                </View>
            ))}
        </View>
    )
}

const UnstyledView = ({ ticket, ticketType }: PropsType) => {

    const properties = ticketType.properties
        .filter(p => p.enabled && !p.highlighted)
        .map(p => p.id);

    const unstyledProps = ticket.translated_data_with_keys
        .filter(dk => Object.values(properties).flat().includes(dk.key))
        .map(d => ({ title: d.translated_name, content: d.value }));

    if (unstyledProps.length === 0) return (<View></View>)

    return (
        <View style={{ ...styles.grid, marginTop: 10 }}>
            {unstyledProps.map((prop, idx) => (
                <View style={styles.infoBox} key={idx}>
                    <Text style={styles.label}>{prop.title}</Text>
                    <Text style={styles.lableValue}>{prop.content}</Text>
                </View>
            ))}
        </View>
    )
}

const AttachmentsPagesView = ({ ticket, company, ticketType }: PropsType) => {
    const supportedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
    const filteredAttachments = ticket.attachments.filter(a => supportedMimeTypes.includes(a.mime_type));

    return (
        filteredAttachments.length > 0 ?
            (<Page size="A4" orientation='landscape' style={styles.page}>
                {filteredAttachments.map((attachment, index) => (
                    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }} key={index}>
                        <View fixed>
                            <HeaderView ticket={ticket} company={company} ticketType={ticketType} />
                        </View>
                        <View style={{ flexGrow: 1, padding: '20px' }}>
                            <View style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>{attachment.name}</Text>
                                <Image src={attachment.source} style={{ width: '90%' }} />
                            </View>
                        </View>
                        <View fixed>
                            <FooterView />
                        </View>
                    </View>
                ))}
            </Page>) : (<View></View>)
    )
}

export const Ticket = ({ ticket, company, ticketType }: PropsType) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
                    <HeaderView ticket={ticket} company={company} ticketType={ticketType} />
                    <View style={{ flexGrow: 1, padding: '15px' }}>
                        <TitleView ticket={ticket} />
                        <MainView ticket={ticket} />
                        <StyledView ticket={ticket} company={company} ticketType={ticketType} />
                        <UnstyledView ticket={ticket} company={company} ticketType={ticketType} />
                        <ApproversView ticket={ticket} />
                    </View>
                    <FooterView />
                </View>
            </Page>
            <AttachmentsPagesView ticket={ticket} company={company} ticketType={ticketType} />
        </Document>
    )
};

