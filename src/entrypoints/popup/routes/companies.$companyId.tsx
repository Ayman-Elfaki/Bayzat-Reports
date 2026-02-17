import { sendMessage } from '@/services/messenger';
import { Box, Button, Stack, Table, Title } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/companies/$companyId')({
    component: Tickets,
    loader: async ({ params }) => {
        const ticketTypes = await sendMessage('listTicketTypes', { companyId: params.companyId });
        return { ticketTypes };
    }
})

function Tickets() {
    const { ticketTypes } = Route.useLoaderData();

    const rows = ticketTypes.map((type) => (
        <Table.Tr key={type.name}>
            <Table.Td>{type.name}</Table.Td>
            <Table.Td>
                <Button component={Link} to={`/tickets/${type.companyId}/${type.id}`} size='compact-xs' variant='subtle'>
                    Settings
                </Button>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack >
            <Stack align='center'>
                <Title>Ticket Types</Title>
            </Stack>
            <Box>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </Box>
        </Stack>
    )
}
