import { Box, Button, ButtonGroup, Stack } from '@mantine/core'
import { useClipboard } from '@mantine/hooks';


export function Login() {
    const clipboard = useClipboard({ timeout: 500 });
    return (
        <Box>
            <Stack align='center'>
                <Button component='a' href='https://app.bayzat.com/auth/login' target='_blank'>Bayzat</Button>
                <ButtonGroup >
                    <Button variant='outline' onClick={() => clipboard.copy('Aziz.h.alabdali@gmail.com')}>Username</Button>
                    <Button variant='outline' onClick={() => clipboard.copy('A827918a_')}>Passowrd</Button>
                </ButtonGroup>
            </Stack>
        </Box>
    )
}