import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Box, Button, Stack, Table, Title, Text, Group, ButtonGroup, Switch } from '@mantine/core';
import { useForm } from '@mantine/form';

export const Route = createFileRoute('/tickets/$companyId/$ticketId')({
  component: Properties,
  loader: async ({ params }) => {
    const ticketType = await sendMessage('getTicketType', { ticketId: params.ticketId, companyId: params.companyId });
    return { ticketType };
  }
})

function Properties() {
  const navigate = useNavigate();
  const { ticketType } = Route.useLoaderData();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { ...ticketType },
  });


  const rows = ticketType?.properties.map((type, index) => (
    <Table.Tr key={type.name}>
      <Table.Td>
        <Text size='xs'>{type.name}</Text>
      </Table.Td>
      <Table.Td>
        <Switch key={form.key(`properties.${index}.enabled`)}
          {...form.getInputProps(`properties.${index}.enabled`, { type: 'checkbox' })} />
      </Table.Td>
      <Table.Td>
        <Switch key={form.key(`properties.${index}.highlighted`)}
          {...form.getInputProps(`properties.${index}.highlighted`, { type: 'checkbox' })} />
      </Table.Td>
    </Table.Tr>
  ));


  const handleSubmit = async (values: Partial<typeof ticketType>) => {
    if (!values?.id || !values?.companyId || !values?.properties) return;
    const data = { ticketId: values.id, companyId: values.companyId, properties: values.properties };
    await sendMessage('setTicketProperties', data);
    await navigate({ to: '/companies/$companyId', params: { companyId: values.companyId } });
  }

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <Stack gap='lg' w={'100%'}>
        <Stack align='center' mb='sm'>
          <Title>Ticket Properties</Title>
          <Title order={4}>{ticketType?.name}</Title>
        </Stack>
        <Box>
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Visible</Table.Th>
                <Table.Th>Highlighted</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Box>
        <Group justify='center'>
          <ButtonGroup>
            <Button component={Link} to={`/companies/${ticketType?.companyId}`} variant="outline">
              Back
            </Button>
            <Button type='submit' variant="gradient">
              Save
            </Button>
          </ButtonGroup>
        </Group>
      </Stack>
    </form>
  )
}
