<script setup lang="ts"></script>

<template>
    <section style="background-color: #cdc4f9">
        <div class="container py-5">
            <div class="card wide-card bg-light">
                <p>Welcome to this little life chat app.</p>
                <br />
                <p>If you change to the 'Chat' tab you will see, who is online.</p>
                <p>When there are at least two people online, a chat session will open.</p>
                <p>This chat session will last until the last online user left.</p>
                <br />
                <p>Info:</p>
                <p>A flashing circle next to a user in a chat session indicates that they are currently typing.</p>
                <p>
                    In the live chat session messages from currently offline users are shown grayed. When they come
                    online again, their messages appear bright again.
                </p>
            </div>
        </div>
    </section>
</template>

<style scoped>
a.add img {
    height: 36px;
}
</style>
