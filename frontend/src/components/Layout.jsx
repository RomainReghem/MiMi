import { Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Nav from "./Nav";

const Layout = () => {
    return (
        <>
        <Flex direction={'column'} minH={'100%'}>
            <Nav />
            <Outlet />

        </Flex>

        </>
    )
}

export default Layout