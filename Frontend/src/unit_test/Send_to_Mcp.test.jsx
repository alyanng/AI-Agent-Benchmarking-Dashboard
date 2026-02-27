// src/__tests__/Send_to_Mcp.test.jsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Send_to_Mcp from '../Send_to_Mcp'


// test 1 
it('After the user enters text, the textarea shows the content',async ()=>{

const user = userEvent.setup();
render(<Send_to_Mcp/>);
const textarea = screen.getByPlaceholderText("Send a message to AI agent");
await user.type(textarea,"fix the code for me");
expect(textarea.value).toBe("fix the code for me");
    
})

// test 2
global.fetch = vi.fn();


it("The user can see the AI's respond after sending the  prompt", async()=>{

const user = userEvent.setup();
    
fetch.mockResolvedValueOnce({json:async()=>({
    data:{result:{content:[{text:'The bug is in line 5.'}]}}
}) })
render(<Send_to_Mcp/>);
await user.type(screen.getByPlaceholderText('Send a message to AI agent'),'Please help me find my error')
await user.click(screen.getByRole('button',{name:/send/i}))

})
