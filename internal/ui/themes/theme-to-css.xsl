<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" encoding="UTF-8"/>

  <xsl:template name="or-default">
    <xsl:param name="value"/>
    <xsl:param name="fallback"/>
    <xsl:choose>
      <xsl:when test="$value != ''"><xsl:value-of select="$value"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="$fallback"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/theme">
    <xsl:variable name="fontFamily">
      <xsl:call-template name="or-default">
        <xsl:with-param name="value" select="layout/connect/@font-family"/>
        <xsl:with-param name="fallback" select="'system'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="fontSize">
      <xsl:call-template name="or-default">
        <xsl:with-param name="value" select="layout/connect/@font-size"/>
        <xsl:with-param name="fallback" select="'lg'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:text>:root {
  --rm-bg-1: </xsl:text><xsl:value-of select="colors/@background1"/><xsl:text>;
  --rm-bg-2: </xsl:text><xsl:value-of select="colors/@background2"/><xsl:text>;
  --rm-fg-1: </xsl:text><xsl:value-of select="colors/@foreground1"/><xsl:text>;
  --rm-fg-2: </xsl:text><xsl:value-of select="colors/@foreground2"/><xsl:text>;
  --rm-fg-3: </xsl:text><xsl:value-of select="colors/@foreground3"/><xsl:text>;
  --rm-action: </xsl:text><xsl:value-of select="colors/@action"/><xsl:text>;
  --rm-accept: </xsl:text><xsl:value-of select="colors/@accept"/><xsl:text>;
  --rm-reject: </xsl:text><xsl:value-of select="colors/@reject"/><xsl:text>;
  --rm-connect-gauge-track: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/connect/@track-color"/><xsl:with-param name="fallback" select="'#3a3f44'"/></xsl:call-template>
    <xsl:text>;
  --rm-connect-gauge-fill: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/connect/@fill-color"/><xsl:with-param name="fallback" select="colors/@action"/></xsl:call-template>
    <xsl:text>;
  --rm-connect-gauge-text: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/connect/@text-color"/><xsl:with-param name="fallback" select="colors/@foreground1"/></xsl:call-template>
    <xsl:text>;
  --rm-connect-prompt-bg: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/connect/@prompt-bg"/><xsl:with-param name="fallback" select="colors/@background1"/></xsl:call-template>
    <xsl:text>;
  --rm-connect-prompt-fg: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/connect/@prompt-fg"/><xsl:with-param name="fallback" select="colors/@foreground2"/></xsl:call-template>
    <xsl:text>;
  --rm-connect-prompt-border: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/connect/@prompt-border"/><xsl:with-param name="fallback" select="colors/@foreground2"/></xsl:call-template>
    <xsl:text>;
  --rm-connect-code-color: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/connect/@code-color"/><xsl:with-param name="fallback" select="colors/@foreground1"/></xsl:call-template>
    <xsl:text>;
  --rm-connect-font-family: </xsl:text>
    <xsl:choose>
      <xsl:when test="$fontFamily = 'serif'">Georgia, "Times New Roman", Times, serif</xsl:when>
      <xsl:when test="$fontFamily = 'mono'">ui-monospace, SFMono-Regular, Menlo, Consolas, monospace</xsl:when>
      <xsl:when test="$fontFamily = 'rounded'">"Trebuchet MS", "Segoe UI", sans-serif</xsl:when>
      <xsl:otherwise>system-ui, -apple-system, "Segoe UI", Roboto, sans-serif</xsl:otherwise>
    </xsl:choose>
    <xsl:text>;
  --rm-connect-font-size: </xsl:text>
    <xsl:choose>
      <xsl:when test="$fontSize = 'sm'">1.5rem</xsl:when>
      <xsl:when test="$fontSize = 'md'">2rem</xsl:when>
      <xsl:when test="$fontSize = 'xl'">3.5rem</xsl:when>
      <xsl:otherwise>2.75rem</xsl:otherwise>
    </xsl:choose>
    <xsl:text>;
  --rm-chrome-folder: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/chrome/@folder-color"/><xsl:with-param name="fallback" select="'#d4b483'"/></xsl:call-template>
    <xsl:text>;
  --rm-chrome-tab: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/chrome/@tab-color"/><xsl:with-param name="fallback" select="'#c4a574'"/></xsl:call-template>
    <xsl:text>;
  --rm-chrome-outline: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/chrome/@outline-color"/><xsl:with-param name="fallback" select="colors/@foreground2"/></xsl:call-template>
    <xsl:text>;
  --rm-chrome-drawer: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/chrome/@drawer-color"/><xsl:with-param name="fallback" select="'#4a4035'"/></xsl:call-template>
    <xsl:text>;
  --rm-chrome-label: </xsl:text>
    <xsl:call-template name="or-default"><xsl:with-param name="value" select="layout/chrome/@label-color"/><xsl:with-param name="fallback" select="'#211e1c'"/></xsl:call-template>
    <xsl:text>;
  --bs-body-bg: </xsl:text><xsl:value-of select="colors/@background1"/><xsl:text> !important;
  --bs-border-color: </xsl:text><xsl:value-of select="colors/@foreground2"/><xsl:text> !important;
  --bs-tertiary-bg: </xsl:text><xsl:value-of select="colors/@background1"/><xsl:text> !important;
  --bs-code-color: </xsl:text><xsl:value-of select="colors/@action"/><xsl:text> !important;
}
</xsl:text>
  </xsl:template>
</xsl:stylesheet>
