import { sendMessage } from '@/services/messenger';
import { Button, Flex, Stack, Table, Title } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: Index,
    loader: async () => {
        const companies = await sendMessage('listCompanies');
        return { companies };
    }
});

function Index() {
    const { companies } = Route.useLoaderData();

    const rows = companies.map((company) => (
        <Table.Tr key={company.name}>
            <Table.Td>{company.name}</Table.Td>
            <Table.Td>
                <Button component={Link} to={`/companies/${company.id}`} size='compact-xs' variant="subtle">
                    SETTINGS
                </Button>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack>
            <Flex justify='center'>
                <img src={'/images/bayzat-report.svg'} height={150} />
            </Flex>
            <Stack >
                {companies.length === 0 ? (
                    <Stack align='center'>
                        <Title order={5}>Please Login Into Bayzat</Title>
                    </Stack>
                ) : (
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                )}
            </Stack>
        </Stack>
    )
}
