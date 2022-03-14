echo '{"id":53,"jsonrpc":"2.0","method":"sync_state_genSyncSpec","params":[true]}' |
    websocat -n1 -B 99999999 wss://rococo-rpc.polkadot.io |
    jq .result > chainSpec.json
