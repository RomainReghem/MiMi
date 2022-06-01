import ChangeMail from "./ChangeMail";
import ChangePwd from "./ChangePwd";
import { Center, Divider, Stack, useBreakpointValue } from "@chakra-ui/react";

const Settings = () => {
    return (
        <>
        <Center flexGrow={1}>
            <Stack w={'md'} p={5} spacing={5}>
                <ChangeMail />
                <Divider />
                <ChangePwd />
            </Stack>
            
        </Center>
        </>
    );
}

export default Settings;